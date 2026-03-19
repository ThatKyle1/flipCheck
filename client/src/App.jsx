import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    // API call wired up in next step
    console.log('submitting', { image, price });
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
              disabled={!image || !price}
              className="w-full font-semibold cursor-pointer"
            >
              Check It
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
