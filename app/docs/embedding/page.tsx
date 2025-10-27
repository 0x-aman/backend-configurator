import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function EmbeddingGuidePage() {
  const embedCode = `<!-- KONFIGRA Configurator Embed -->
<div id="konfigra-configurator"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/embed.js';
    script.setAttribute('data-public-key', 'YOUR_PUBLIC_KEY');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Embedding Guide</h1>
          <p className="text-xl text-muted-foreground">
            Step-by-step instructions for adding KONFIGRA to your website.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Step 1: Get Your Embed Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log into your KONFIGRA dashboard</li>
                <li>Navigate to "Embed Script" in the sidebar</li>
                <li>Copy your unique embed code</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Step 2: Add to Your Website</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Paste the embed code where you want the configurator to appear:</p>
              <div className="relative mt-4">
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm">
                  <code>{embedCode}</code>
                </pre>
              </div>
              <p className="mt-4">
                Replace <code className="bg-muted px-2 py-1 rounded">YOUR_PUBLIC_KEY</code> with your actual public key from the dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Step 3: Configure Container</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You can style the container div to control sizing and positioning:</p>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm mt-4">
{`<div id="konfigra-configurator" 
     style="max-width: 1200px; margin: 0 auto;">
</div>`}
              </pre>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Platform-Specific Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <div>
                <h4 className="font-semibold mb-2">WordPress</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Go to the page/post editor</li>
                  <li>Add a "Custom HTML" block</li>
                  <li>Paste the embed code</li>
                  <li>Publish or update the page</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Shopify</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Go to Online Store &gt; Themes</li>
                  <li>Click "Edit code" on your active theme</li>
                  <li>Open the template where you want to add the configurator</li>
                  <li>Paste the embed code</li>
                  <li>Save the changes</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Wix</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Open the Wix Editor</li>
                  <li>Click the "+" button to add elements</li>
                  <li>Select "Embed Code" from the menu</li>
                  <li>Choose "Custom embeds"</li>
                  <li>Paste the embed code</li>
                  <li>Position and resize as needed</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Custom HTML/React</h4>
                <p>Simply paste the code into your HTML or use dangerouslySetInnerHTML in React:</p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm mt-2">
{`<div 
  dangerouslySetInnerHTML={{ __html: embedCode }}
/>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You can pass additional configuration via data attributes:</p>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm mt-4">
{`<script
  src="https://your-domain.com/embed.js"
  data-public-key="YOUR_PUBLIC_KEY"
  data-configurator-id="config_123"
  data-theme="dark"
  data-language="en"
  async
></script>`}
              </pre>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>After embedding:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Check that the configurator loads correctly</li>
                <li>Test all interactive elements</li>
                <li>Verify quote submission works</li>
                <li>Test on different devices and browsers</li>
                <li>Check analytics in your dashboard</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>If the configurator doesn't appear:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verify your public key is correct</li>
                <li>Check browser console for errors</li>
                <li>Ensure your domain is whitelisted in dashboard settings</li>
                <li>Clear browser cache and reload</li>
                <li>Contact support if issues persist</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border/40 py-8 px-4 mt-16">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 KONFIGRA. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
