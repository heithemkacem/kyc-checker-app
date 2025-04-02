// File: app/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// API URL - change this based on your deployment
const API_URL = "http://localhost:8000";

export default function Home() {
  const [jsonData, setJsonData] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [results, setResults] = useState<{
    risk: any;
    fraud: any;
    compliance: any;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Read the file content
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          setJsonData(fileContent);
          // Validate JSON
          JSON.parse(fileContent);
          setError("");
        } catch (err) {
          setError("Invalid JSON format in file");
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonData(value);
    try {
      if (value) {
        JSON.parse(value);
        setError("");
      }
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  const analyzeKyc = async () => {
    if (!jsonData) {
      setError("Please provide JSON data for analysis");
      return;
    }

    try {
      const parsedData = JSON.parse(jsonData);
      setIsLoading(true);
      setError("");

      // Call the KYC analysis API
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: parsedData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "API request failed");
      }

      const analysisResults = await response.json();
      console.log(analysisResults);
      setResults(analysisResults);
      setIsLoading(false);
    } catch (err: any) {
      setError(`Error analyzing KYC data: ${err.message}`);
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 0.3) return "bg-green-100 text-green-800";
    if (score < 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  const generatePdf = async () => {
    if (!results) {
      setError("No analysis results available for PDF generation.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(results),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(`Error generating PDF: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">KYC Analysis Dashboard</h1>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>KYC Data Input</CardTitle>
          <CardDescription>
            Upload a JSON file or enter JSON data directly for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="json" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json">JSON Input</TabsTrigger>
              <TabsTrigger value="upload">File Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="json">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="json-input">Enter JSON Data</Label>
                  <Textarea
                    id="json-input"
                    placeholder='{"full_name": "John Doe", "dob": "1990-01-01", ...}'
                    className="min-h-32"
                    value={jsonData}
                    onChange={handleJsonChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="file-upload">Upload JSON File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  {file && (
                    <p className="text-sm text-gray-500">
                      Selected file: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full mt-4"
            onClick={analyzeKyc}
            disabled={isLoading || !jsonData || !!error}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze KYC Data"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sample JSON Example */}
      <Card className="w-full max-w-3xl mt-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Example JSON Format</CardTitle>
        </CardHeader>
        <CardContent className="text-xs p-4 bg-gray-50 font-mono overflow-auto max-h-32">
          {JSON.stringify(
            {
              full_name: "John Doe",
              dob: "1985-06-15",
              nationality: "USA",
              id_number: "A1234567",
              email: "john.doe@example.com",
              phone_number: "+1234567890",
              address: "123 Main Street, New York, NY",
              transaction_history: [
                {
                  amount: 5000,
                  currency: "USD",
                  location: "New York",
                  type: "Deposit",
                },
                {
                  amount: 20000,
                  currency: "USD",
                  location: "Dubai",
                  type: "Wire Transfer",
                },
              ],
            },
            null,
            2
          )}
        </CardContent>
      </Card>

      {results && (
        <Card className="w-full max-w-3xl mt-8">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Combined risk, fraud, and compliance analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Risk Assessment */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Risk Assessment</h3>
                  <Badge className={getRiskColor(results.risk.risk_score)}>
                    Score: {(results.risk.risk_score * 100).toFixed(0)}%
                  </Badge>
                </div>
                <p>{results.risk.recommendation}</p>
              </div>

              {/* Fraud Detection */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Fraud Detection</h3>
                  {results.fraud.fraud_detected ? (
                    <Badge variant="destructive" className="flex items-center">
                      <XCircle className="mr-1 h-4 w-4" />
                      Fraud Detected
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 flex items-center"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      No Fraud Detected
                    </Badge>
                  )}
                </div>
                {results.fraud.fraud_reasons.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {results.fraud.fraud_reasons.map(
                      (reason: string, index: number) => (
                        <li key={index}>{reason}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No fraud indicators found in the provided data.</p>
                )}
              </div>

              {/* Compliance Check */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Compliance Check</h3>
                  {results.compliance.compliance_issues.length > 0 ? (
                    <Badge variant="destructive">Issues Found</Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      Compliant
                    </Badge>
                  )}
                </div>
                {results.compliance.compliance_flags.length > 0 && (
                  <>
                    <h4 className="font-medium mb-1">Flags:</h4>
                    <ul className="list-disc pl-5 mb-2">
                      {results.compliance.compliance_flags.map(
                        (flag: string, index: number) => (
                          <li key={index}>{flag}</li>
                        )
                      )}
                    </ul>
                  </>
                )}
                {results.compliance.compliance_issues.length > 0 ? (
                  <>
                    <h4 className="font-medium mb-1">Issues:</h4>
                    <ul className="list-disc pl-5">
                      {results.compliance.compliance_issues.map(
                        (issue: string, index: number) => (
                          <li key={index}>{issue}</li>
                        )
                      )}
                    </ul>
                  </>
                ) : (
                  <p>No compliance issues found.</p>
                )}
              </div>
              <Button
                className="w-full mt-4"
                onClick={generatePdf}
                disabled={!results}
              >
                Generate PDF Report
              </Button>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download="KYC_Report.pdf"
                  className="mt-4 text-blue-500 underline"
                >
                  Download KYC Report
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
