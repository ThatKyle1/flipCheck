import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL;

function compressAndEncode(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
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
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch(`${API_URL}/api/history`);
      const data = await res.json();
      setHistory(data);
    } catch {
      // silently fail — history is non-critical
    }
  }

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
      const imageBase64 = await compressAndEncode(image);
      const res = await fetch(`${API_URL}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType: 'image/jpeg', price }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult(data);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center gap-6 py-10">

      {/* Main card */}
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-primary tracking-tight">FlipCheck</CardTitle>
          <CardDescription>Upload a garment photo to get a Depop resale estimate.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

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

            <Button type="submit" disabled={!image || !price || loading} className="w-full font-semibold cursor-pointer">
              {loading ? 'Analyzing...' : 'Check It'}
            </Button>

          </form>

          {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

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
              <p className="text-xs text-muted-foreground border-t border-border pt-3">{result.reasoning}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Lookups</h2>
          {history.map((item) => (
            <div key={item._id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Paid ${item.purchasePrice}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">${item.resaleValue}</p>
                <p className={`text-xs font-semibold ${RECOMMENDATION_STYLES[item.recommendation]}`}>
                  {item.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default App;
