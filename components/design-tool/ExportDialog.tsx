import React, { useState } from 'react';
import { useDesignToolStore } from '@/store/useDesignToolStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';

interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'json';
  quality: number;
  scale: number;
  name: string;
}

export const ExportDialog: React.FC = () => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 100,
    scale: 1,
    name: 'design'
  });

  const { fabricCanvas } = useDesignToolStore();

  const handleExport = () => {
    if (!fabricCanvas) return;

    switch (options.format) {
      case 'png':
      case 'jpeg':
        const dataURL = fabricCanvas.toDataURL({
          format: options.format,
          quality: options.quality / 100,
          multiplier: options.scale
        });
        downloadFile(dataURL, `${options.name}.${options.format}`);
        break;

      case 'svg':
        const svg = fabricCanvas.toSVG();
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadFile(svgUrl, `${options.name}.svg`);
        URL.revokeObjectURL(svgUrl);
        break;

      case 'json':
        const json = JSON.stringify(fabricCanvas.toJSON(), null, 2);
        const jsonBlob = new Blob([json], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        downloadFile(jsonUrl, `${options.name}.json`);
        URL.revokeObjectURL(jsonUrl);
        break;
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Design</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select
              value={options.format}
              onValueChange={(value: ExportOptions['format']) =>
                setOptions({ ...options, format: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG Image</SelectItem>
                <SelectItem value="jpeg">JPEG Image</SelectItem>
                <SelectItem value="svg">SVG Vector</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(options.format === 'png' || options.format === 'jpeg') && (
            <>
              <div className="grid gap-2">
                <Label>Quality ({options.quality}%)</Label>
                <Input
                  type="range"
                  min="1"
                  max="100"
                  value={options.quality}
                  onChange={(e) =>
                    setOptions({ ...options, quality: Number(e.target.value) })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Scale ({options.scale}x)</Label>
                <Input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={options.scale}
                  onChange={(e) =>
                    setOptions({ ...options, scale: Number(e.target.value) })
                  }
                />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label>File Name</Label>
            <Input
              value={options.name}
              onChange={(e) => setOptions({ ...options, name: e.target.value })}
              placeholder="Enter file name"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleExport}>Export</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 