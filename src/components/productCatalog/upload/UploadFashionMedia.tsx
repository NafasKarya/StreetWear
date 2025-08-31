import React from "react";

interface UploadFashionMediaProps {
  frontImage: string;
  backImage: string;
  productDetail: string;
  setFrontImage: (v: string) => void;
  setBackImage: (v: string) => void;
  setProductDetail: (v: string) => void;
  handleImageInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => void;
}

const UploadFashionMedia: React.FC<UploadFashionMediaProps> = ({
  frontImage,
  backImage,
  productDetail,
  setFrontImage,
  setBackImage,
  setProductDetail,
  handleImageInput,
}) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {/* Gambar Depan */}
      <div>
        <label className="block text-xs mb-1 text-blue-300">Gambar Depan *</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleImageInput(e, setFrontImage)}
          className="block bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[160px]"
          required
        />
        {frontImage && (
          <img
            src={frontImage}
            alt="Gambar Depan"
            className="w-20 h-20 object-cover mt-2 border border-blue-400 rounded"
          />
        )}
      </div>
      {/* Gambar Belakang (opsional) */}
      <div>
        <label className="block text-xs mb-1 text-blue-200">Gambar Belakang</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleImageInput(e, setBackImage)}
          className="block bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-[160px]"
        />
        {backImage && (
          <img
            src={backImage}
            alt="Gambar Belakang"
            className="w-20 h-20 object-cover mt-2 border border-blue-200 rounded"
          />
        )}
      </div>
      {/* Detail Produk */}
      <div className="flex-1 min-w-[240px]">
        <label className="block text-xs mb-1 text-gray-400">Detail Produk *</label>
        <textarea
          value={productDetail}
          onChange={e => setProductDetail(e.target.value)}
          className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded text-gray-100 w-full h-[70px]"
          placeholder="Tulis detail produk"
          required
        />
      </div>
    </div>
  );
};

export default UploadFashionMedia;
