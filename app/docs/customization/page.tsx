import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CustomizationPage() {
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
          <h1 className="text-4xl font-bold mb-4">Customization Options</h1>
          <p className="text-xl text-muted-foreground">
            Learn how to customize your configurator to match your brand.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Customize the look and feel of your configurator with themes. You can set:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Primary Color:</strong> Main brand color used for buttons and accents</li>
                <li><strong>Secondary Color:</strong> Supporting color for secondary elements</li>
                <li><strong>Background Color:</strong> Main background color</li>
                <li><strong>Text Color:</strong> Primary text color</li>
                <li><strong>Border Radius:</strong> Roundness of corners (e.g., 0.5rem)</li>
              </ul>
              <div className="mt-4">
                <p className="font-semibold mb-2">Example Configuration:</p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm">
{`{
  "primaryColor": "#0ea5e9",
  "secondaryColor": "#8b5cf6",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937",
  "borderRadius": "0.75rem"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Customize fonts to match your brand identity:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Font Family:</strong> Primary font (e.g., "Inter", "Roboto")</li>
                <li><strong>Heading Font:</strong> Font for headings (optional)</li>
                <li><strong>Body Font:</strong> Font for body text (optional)</li>
              </ul>
              <div className="mt-4">
                <p className="font-semibold mb-2">Example:</p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm">
{`{
  "fontFamily": "Inter, sans-serif",
  "headingFont": "Poppins, sans-serif"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                For advanced customization, you can add custom CSS to override default styles:
              </p>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm mt-4">
{`.configurator-container {
  max-width: 1200px;
  margin: 0 auto;
}

.option-card {
  transition: transform 0.2s;
}

.option-card:hover {
  transform: scale(1.05);
}`}
              </pre>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Layout Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Customize the layout of your configurator:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Max Width:</strong> Maximum width of the configurator (e.g., "1200px")</li>
                <li><strong>Spacing Unit:</strong> Base spacing unit (e.g., "1rem")</li>
                <li><strong>Grid Columns:</strong> Number of columns for option display</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Behavior Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Control how your configurator behaves:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Allow Quotes:</strong> Enable/disable quote generation</li>
                <li><strong>Require Email:</strong> Require email for quotes</li>
                <li><strong>Auto Pricing:</strong> Automatically calculate total price</li>
                <li><strong>Show Total:</strong> Display total price to users</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Accessing Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>To customize your configurator:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log into your KONFIGRA dashboard</li>
                <li>Navigate to the Themes section</li>
                <li>Create a new theme or edit an existing one</li>
                <li>Apply your theme to a configurator</li>
                <li>Preview changes in real-time</li>
              </ol>
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
