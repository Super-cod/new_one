import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneData } from '@/lib/types';

interface GeneInfoCardProps {
  gene: GeneData;
  confidenceScore: number;
  className?: string;
}

export function GeneInfoCard({ gene, confidenceScore, className }: GeneInfoCardProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Card className={`${className} bg-transparent border-none shadow-none border-grey-200 shadow-sm`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900">
          Gene Information
          <span className="text-sm font-normal text-gray-600">
            ID: {gene.ncbi_id}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gene Name and Species */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Gene Name</label>
            <p className="text-lg font-semibold text-primary">{gene.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Species</label>
            <p className="text-sm capitalize text-gray-800">{gene.species.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Sequence Info */}
        <div>
          <label className="text-sm font-medium text-gray-600">Sequence Length</label>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">{gene.sequence_length.toLocaleString()}</span> base pairs
          </p>
        </div>

        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600">Confidence Score</label>
            <span className="text-sm font-medium text-gray-800">
              {getConfidenceLabel(confidenceScore)} ({(confidenceScore * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getConfidenceColor(confidenceScore)}`}
              style={{ width: `${confidenceScore * 100}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-600">Description</label>
          <p className="text-sm mt-1 leading-relaxed text-gray-700">{gene.description}</p>
        </div>

        {/* Sequence Preview */}
        <div>
          <label className="text-sm font-medium text-gray-600">Sequence Preview</label>
          <div className="mt-1 p-3 bg-white/30 backdrop-blur-sm rounded-md border border-white/30">
            <code className="text-xs font-mono text-gray-700 break-all">
              {gene.sequence.substring(0, 100)}
              {gene.sequence.length > 100 && (
                <span className="text-gray-500">...({(gene.sequence.length - 100).toLocaleString()} more)</span>
              )}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
