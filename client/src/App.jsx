import { useState, useRef } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [price, setPrice] = useState('');
  const fileInputRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // API call will be wired up in the next step
    console.log('submitting', { image, price });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        <h1 className="text-3xl font-bold text-purple-600 mb-2">FlipCheck</h1>
        <p className="text-gray-500 text-sm mb-6">Upload a garment photo to get a resale estimate.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Image upload */}
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl h-52 flex items-center justify-center cursor-pointer hover:border-purple-400 transition overflow-hidden"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-4xl mb-1">📷</p>
                <p className="text-sm">Click to upload a photo</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Price input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 12.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!image || !price}
            className="bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check It
          </button>

        </form>
      </div>
    </div>
  );
}

export default App;
