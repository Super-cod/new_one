import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OffTargetAnalysis as OffTargetAnalysisType } from '@/lib/types';

interface OffTargetAnalysisProps {
  analysis: OffTargetAnalysisType;
  className?: string;
}

export function OffTargetAnalysis({ analysis, className }: OffTargetAnalysisProps) {
  const getRiskLevel = (sitesFound: number) => {
    if (sitesFound === 0) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (sitesFound <= 3) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const risk = getRiskLevel(analysis.total_sites);

  return (
    <Card className={`${className} bg-transparent border-none shadow-none`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Off-Target Analysis
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${risk.color} ${risk.bgColor}`}>
            {risk.level} Risk
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sites Found */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium">Potential Off-Target Sites</h4>
            <p className="text-xs text-muted-foreground">
              Locations where unintended modifications could occur
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${risk.color}`}>
              {analysis.total_sites}
            </div>
            <div className="text-xs text-muted-foreground">sites found</div>
          </div>
        </div>

        {/* High Risk Sites */}
        {analysis.high_risk_sites > 0 && (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h4 className="text-sm font-medium text-red-800">High Risk Sites</h4>
              <p className="text-xs text-red-600">
                Sites with significant off-target potential
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {analysis.high_risk_sites}
              </div>
              <div className="text-xs text-red-600">high risk</div>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        <div>
          <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
          {analysis.total_sites === 0 ? (
            <Alert>
              <AlertDescription>
                ✅ No significant off-target sites detected. This genetic modification appears to have high specificity.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant={analysis.total_sites > 3 ? 'destructive' : 'default'}>
              <AlertDescription>
                {analysis.total_sites <= 3 ? '⚠️' : '❌'} {analysis.total_sites} potential off-target site{analysis.total_sites > 1 ? 's' : ''} detected. 
                {analysis.total_sites > 3 
                  ? ' High risk of unintended modifications - additional validation recommended.'
                  : ' Moderate risk - consider additional specificity controls.'
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Warnings */}
        {analysis.warnings && analysis.warnings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Warnings & Recommendations</h4>
            <div className="space-y-2">
              {analysis.warnings.map((warning, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription className="text-sm">
                    {warning}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-3 border rounded-lg">
          <h4 className="text-sm font-medium mb-2">Safety Recommendations</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            {analysis.total_sites > 0 && (
              <>
                <li>• Perform experimental validation with guide RNA specificity assays</li>
                <li>• Consider using high-fidelity editing enzymes</li>
                <li>• Implement additional screening methods for off-target detection</li>
              </>
            )}
            {analysis.total_sites === 0 && (
              <>
                <li>• Proceed with standard safety protocols</li>
                <li>• Monitor for unexpected phenotypes during implementation</li>
                <li>• Consider pilot studies before full-scale application</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
