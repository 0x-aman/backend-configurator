import { env } from "@/src/config/env";
import { toast } from "sonner";

export async function openConfiguratorEditor(publicId: string) {
  try {
    toast.loading("Opening editor...");

    const tokenRes = await fetch("/api/configurator/generate-edit-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configuratorId: publicId }),
    });

    if (!tokenRes.ok) {
      toast.error("Failed to create edit token");
      return;
    }

    const tokenJson = await tokenRes.json();
    const token = tokenJson?.data?.token;

    if (!token) {
      toast.error("No token returned");
      return;
    }

    const adminUrl = `${env.EMBED_URL}/?admin=true&token=${encodeURIComponent(
      token
    )}`;

    window.open(adminUrl, "_blank");
    toast.success("Editor opened");
  } catch (err) {
    console.error(err);
    toast.error("Failed to open editor");
  } finally {
    toast.dismiss();
  }
}
