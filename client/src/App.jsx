import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = 'http://localhost:5001';

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const RECOMMENDATION_STYLES = {
  Buy: 'text-green-400',
  Pass: 'text-red-400',
  Maybe: 'text-yellow-400',
};

function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [price, setPrice] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageBase64 = await toBase64(image);
      const mediaType = image.type;

      const res = await fetch(`${API_URL}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType, price }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-primary tracking-tight">
            FlipCheck
          </CardTitle>
          <CardDescription>
            Upload a garment photo to get a Depop resale estimate.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Image upload */}
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-border rounded-xl h-56 flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden bg-muted/30"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <div className="text-center text-muted-foreground select-none">
                  <p className="text-4xl mb-2">📷</p>
                  <p className="text-sm font-medium">Click to upload a photo</p>
                  <p className="text-xs mt-1 opacity-60">JPG, PNG, WEBP</p>
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Purchase price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 12.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!image || !price || loading}
              className="w-full font-semibold cursor-pointer"
            >
              {loading ? 'Analyzing...' : 'Check It'}
            </Button>

          </form>

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6 border border-border rounded-xl p-4 flex flex-col gap-3 bg-muted/20">
              <p className="text-sm text-muted-foreground">{result.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Resale Value</p>
                  <p className="text-2xl font-bold text-foreground">${result.resaleValue}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Verdict</p>
                  <p className={`text-2xl font-bold ${RECOMMENDATION_STYLES[result.recommendation]}`}>
                    {result.recommendation}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground border-t border-border pt-3">
                {result.reasoning}
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

export default App;
