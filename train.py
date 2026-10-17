import os
import time
import pickle
import argparse
import numpy as np
import cv2
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelBinarizer
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Activation, BatchNormalization, Dropout, Flatten, Dense, Input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ReduceLROnPlateau, ModelCheckpoint

def load_data(dataset_dir, max_per_class=200, target_size=(256, 256)):
    print(f"[INFO] Scanning dataset in: {dataset_dir}")
    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    classes = sorted([d for d in os.listdir(dataset_dir) if not d.startswith('.') and os.path.isdir(os.path.join(dataset_dir, d))])
    print(f"[INFO] Found {len(classes)} classes.")

    image_list = []
    label_list = []
    
    t0 = time.time()
    for idx, class_name in enumerate(classes, 1):
        class_folder = os.path.join(dataset_dir, class_name)
        all_files = [f for f in os.listdir(class_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        selected_files = all_files[:max_per_class] if max_per_class > 0 else all_files

        print(f"[{idx}/{len(classes)}] Loading {len(selected_files)} images from: {class_name}...")
        for img_name in selected_files:
            img_path = os.path.join(class_folder, img_name)
            try:
                img = cv2.imread(img_path)
                if img is not None:
                    img = cv2.resize(img, target_size)
                    image_list.append(img)
                    label_list.append(class_name)
            except Exception as e:
                print(f"  [WARN] Failed to load {img_path}: {e}")

    print(f"[INFO] Completed loading {len(image_list)} images in {time.time() - t0:.1f} seconds.")
    return image_list, label_list, classes

def build_model(input_shape, num_classes):
    model = Sequential([
        Input(shape=input_shape),
        Conv2D(32, (3, 3), padding="same"),
        Activation("relu"),
        BatchNormalization(),
        MaxPooling2D(pool_size=(3, 3)),
        Dropout(0.25),

        Conv2D(64, (3, 3), padding="same"),
        Activation("relu"),
        BatchNormalization(),
        Conv2D(64, (3, 3), padding="same"),
        Activation("relu"),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),

        Conv2D(128, (3, 3), padding="same"),
        Activation("relu"),
        BatchNormalization(),
        Conv2D(128, (3, 3), padding="same"),
        Activation("relu"),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),

        Flatten(),
        Dense(1024),
        Activation("relu"),
        BatchNormalization(),
        Dropout(0.5),

        Dense(num_classes),
        Activation("softmax")
    ])
    return model

def main():
    parser = argparse.ArgumentParser(description="Train Plant Disease Detection CNN")
    parser.add_argument("--dataset", type=str, default="PlantVillage/plantvillage dataset/color", help="Dataset directory")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--max-per-class", type=int, default=200, help="Max images per class (0 for all)")
    args = parser.parse_args()

    image_list, label_list, class_names = load_data(args.dataset, max_per_class=args.max_per_class)

    print("[INFO] Binarizing labels...")
    label_binarizer = LabelBinarizer()
    image_labels = label_binarizer.fit_transform(label_list)

    with open("label_transform.pkl", "wb") as f:
        pickle.dump(label_binarizer, f)
    print(f"[INFO] Saved label_transform.pkl with {len(label_binarizer.classes_)} classes.")

    print("[INFO] Normalizing images to [0, 1] range...")
    np_images = np.array(image_list, dtype=np.float32) / 255.0
    del image_list  # Free raw image list from memory

    print("[INFO] Splitting dataset into 80% train / 20% test...")
    x_train, x_test, y_train, y_test = train_test_split(
        np_images, image_labels, test_size=0.2, random_state=42, stratify=image_labels
    )
    del np_images
    print(f"[INFO] Train samples: {len(x_train)}, Test/Val samples: {len(x_test)}")

    aug = ImageDataGenerator(
        rotation_range=25,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode="nearest"
    )

    print("[INFO] Building CNN architecture...")
    model = build_model((256, 256, 3), len(class_names))
    opt = Adam(learning_rate=1e-3)
    model.compile(loss="categorical_crossentropy", optimizer=opt, metrics=["accuracy"])
    model.summary()

    callbacks = [
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6, verbose=1)
    ]

    print(f"\n[INFO] Starting training for {args.epochs} epochs (Batch size: {args.batch_size})...\n")
    start_time = time.time()
    history = model.fit(
        aug.flow(x_train, y_train, batch_size=args.batch_size),
        validation_data=(x_test, y_test),
        steps_per_epoch=len(x_train) // args.batch_size,
        epochs=args.epochs,
        callbacks=callbacks,
        verbose=1
    )
    total_duration = time.time() - start_time
    print(f"\n[INFO] Training finished in {total_duration/60:.2f} minutes.")

    print("\n[INFO] Evaluating on test set...")
    scores = model.evaluate(x_test, y_test, verbose=0)
    print(f"[RESULT] Test Loss: {scores[0]:.4f}")
    print(f"[RESULT] Test Accuracy: {scores[1]*100:.2f}%")

    print("[INFO] Saving model to cnn_model.pkl and cnn_model.keras...")
    with open("cnn_model.pkl", "wb") as f:
        pickle.dump(model, f)
    model.save("cnn_model.keras")
    print("[INFO] Model saved successfully.")

    os.makedirs("output_graphs", exist_ok=True)
    epochs_range = range(1, len(history.history["accuracy"]) + 1)

    # Plot Accuracy
    plt.figure(figsize=(8, 6))
    plt.plot(epochs_range, history.history["accuracy"], "b-o", label="Training Accuracy")
    plt.plot(epochs_range, history.history["val_accuracy"], "r-o", label="Validation Accuracy")
    plt.title(f"Training and Validation Accuracy ({args.epochs} Epochs)")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.grid(True)
    plt.savefig("output_graphs/training_accuracy.png", dpi=150)
    plt.close()

    # Plot Loss
    plt.figure(figsize=(8, 6))
    plt.plot(epochs_range, history.history["loss"], "b-o", label="Training Loss")
    plt.plot(epochs_range, history.history["val_loss"], "r-o", label="Validation Loss")
    plt.title(f"Training and Validation Loss ({args.epochs} Epochs)")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.grid(True)
    plt.savefig("output_graphs/training_loss.png", dpi=150)
    plt.close()
    print("[INFO] Saved updated plots to output_graphs/training_accuracy.png and training_loss.png")

if __name__ == "__main__":
    main()
