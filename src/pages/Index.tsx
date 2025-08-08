import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";

const Index = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [successHash, setSuccessHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSuccessHash(null);
    setError(null);
    if (!isValidAddress) {
      setError("Please enter a valid Ethereum address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Request failed. Please try again later.");
      }
      const txHash: string | undefined = data?.txHash || data?.hash || data?.transactionHash;
      if (txHash) {
        setSuccessHash(txHash);
      } else {
        setSuccessHash(null);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const explorerUrl = successHash ? `https://sepolia.basescan.org/tx/${successHash}` : "";

  return (
    <div className="app-ambient min-h-screen">
      <main className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <section className="w-full max-w-md">
          <h1 className="mb-6 text-center text-3xl font-bold tracking-tight sm:text-4xl">Base Sepolia Faucet</h1>
          <Card className="shadow-sm">
            <CardHeader>
              <CardDescription>Get test ETH for Base Sepolia to try your dApps.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Wallet Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value.trim())}
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="text"
                    aria-invalid={address.length > 0 && !isValidAddress}
                    aria-describedby="address-help"
                  />
                  <p id="address-help" className="text-xs text-muted-foreground">
                    Enter your Base-compatible Ethereum address.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successHash && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Request sent</AlertTitle>
                    <AlertDescription>
                      Tx hash:{" "}
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 underline underline-offset-4"
                      >
                        {successHash.slice(0, 10)}… <ExternalLink className="h-3 w-3" />
                      </a>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2 pt-2">
                  <Button type="submit" disabled={loading || !isValidAddress} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      "Request ETH"
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Rate limited: 1 request per 24h per address
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
