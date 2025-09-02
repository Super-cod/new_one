import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SequenceDisplayProps {
  originalSequence: string;
  optimizedSequence: string;
  insertionLocus: string;
  className?: string;
}

export function SequenceDisplay({ 
  originalSequence, 
  optimizedSequence, 
  insertionLocus,
  className 
}: SequenceDisplayProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'optimized'>('optimized');
  const [showFullSequence, setShowFullSequence] = useState(false);

  const displaySequence = activeTab === 'original' ? originalSequence : optimizedSequence;
  const previewLength = 200;
  const isLongSequence = displaySequence.length > previewLength;

  const formatSequence = (sequence: string, showFull: boolean) => {
    const seq = showFull ? sequence : sequence.substring(0, previewLength);
    return seq.match(/.{1,10}/g)?.join(' ') || seq;
  };

  const calculateDifferences = () => {
    let differences = 0;
    const minLength = Math.min(originalSequence.length, optimizedSequence.length);
    
    for (let i = 0; i < minLength; i++) {
      if (originalSequence[i] !== optimizedSequence[i]) {
        differences++;
      }
    }
    
    differences += Math.abs(originalSequence.length - optimizedSequence.length);
    return differences;
  };

  const differenceCount = calculateDifferences();
  const differencePercentage = ((differenceCount / Math.max(originalSequence.length, optimizedSequence.length)) * 100).toFixed(2);

  return (
    <Card className={`${className} bg-transparent border-none shadow-none`}>
      <CardHeader>
        <CardTitle>Genetic Sequences</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>Insertion Locus: <span className="font-mono font-semibold">{insertionLocus}</span></p>
          {optimizedSequence !== originalSequence && (
            <p>Optimization changes: <span className="font-semibold">{differenceCount} differences ({differencePercentage}%)</span></p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tab Selection */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'original' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('original')}
            className="flex-1"
          >
            Original Sequence
          </Button>
          <Button
            variant={activeTab === 'optimized' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('optimized')}
            className="flex-1"
          >
            Optimized Sequence
          </Button>
        </div>

        {/* Sequence Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Length:</span>
            <span className="ml-2 font-semibold">{displaySequence.length.toLocaleString()} bp</span>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-2 font-semibold">
              {activeTab === 'original' ? 'Natural' : 'Codon-optimized'}
            </span>
          </div>
        </div>

        {/* Optimization Alert */}
        {activeTab === 'optimized' && optimizedSequence !== originalSequence && (
          <Alert>
            <AlertDescription>
              This sequence has been optimized for enhanced expression in the target organism. 
              {differenceCount > 0 && ` ${differenceCount} changes were made to improve codon usage and reduce secondary structures.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Sequence Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {activeTab === 'original' ? 'Original' : 'Optimized'} DNA Sequence
            </h4>
            {isLongSequence && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullSequence(!showFullSequence)}
              >
                {showFullSequence ? 'Show Preview' : 'Show Full Sequence'}
              </Button>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md border max-h-64 overflow-y-auto">
            <code className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
              {formatSequence(displaySequence, showFullSequence)}
              {!showFullSequence && isLongSequence && (
                <span className="text-muted-foreground">
                  \n... ({(displaySequence.length - previewLength).toLocaleString()} more characters)
                </span>
              )}
            </code>
          </div>
        </div>

        {/* Download Options */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([displaySequence], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeTab}_sequence.fasta`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download FASTA
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(displaySequence);
            }}
          >
            Copy to Clipboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
