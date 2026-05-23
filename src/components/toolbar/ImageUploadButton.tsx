import { useRef } from "react";

type ImageUploadButtonProps = {
  onAddImage: (file: File) => void | Promise<void>;
};

export function ImageUploadButton({ onAddImage }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button type="button" onClick={() => fileInputRef.current?.click()}>
        Upload image
      </button>
      <input
        ref={fileInputRef}
        className="toolbar__file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          void onAddImage(file);
          event.target.value = "";
        }}
      />
    </>
  );
}
