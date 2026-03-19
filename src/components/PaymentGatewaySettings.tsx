import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Wallet, Shield, CheckCircle2, AlertCircle, Smartphone, CreditCard } from "lucide-react";

type GatewayType = "iotec" | "mtn_momo" | "airtel_money";

interface GatewayConfig {
  [key: string]: string;
}

interface GatewaySetting {
  id: string;
  user_id: string;
  gateway_type: GatewayType;
  currency: string;
  is_active: boolean;
  gateway_config: GatewayConfig;
  created_at: string;
  updated_at: string;
}

const GATEWAY_OPTIONS: { value: GatewayType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "iotec",
    label: "Iotec Pay",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Mobile money aggregator — MTN, Airtel, and card payments via single integration"
  },
  {
    value: "mtn_momo",
    label: "MTN Mobile Money",
    icon: <Smartphone className="h-5 w-5" />,
    description: "Direct MTN Mobile Money integration for UGX collections"
  },
  {
    value: "airtel_money",
    label: "Airtel Money",
    icon: <Smartphone className="h-5 w-5" />,
    description: "Direct Airtel Money integration for UGX collections"
  }
];

const GATEWAY_FIELDS: Record<GatewayType, { key: string; label: string; placeholder: string; type?: string }[]> = {
  iotec: [
    { key: "wallet_id", label: "Iotec Wallet ID", placeholder: "e.g., WLT-XXXX-XXXX" },
    { key: "client_id", label: "Iotec Client ID", placeholder: "e.g., CL-XXXX-XXXX" },
    { key: "api_secret", label: "Iotec API Secret", placeholder: "Your Iotec API secret key", type: "password" },
  ],
  mtn_momo: [
    { key: "collection_user_id", label: "MTN Collection User ID", placeholder: "Your MTN API User ID" },
    { key: "api_key", label: "MTN API Key", placeholder: "Your MTN API key", type: "password" },
    { key: "subscription_key", label: "MTN Subscription Key", placeholder: "Primary or secondary key", type: "password" },
    { key: "phone_number", label: "Collection Phone Number", placeholder: "+256XXXXXXXXX" },
  ],
  airtel_money: [
    { key: "client_id", label: "Airtel Client ID", placeholder: "Your Airtel client ID" },
    { key: "client_secret", label: "Airtel Client Secret", placeholder: "Your Airtel client secret", type: "password" },
    { key: "phone_number", label: "Collection Phone Number", placeholder: "+256XXXXXXXXX" },
  ]
};

const CURRENCIES = [
  { value: "UGX", label: "UGX — Ugandan Shilling" },
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "TZS", label: "TZS — Tanzanian Shilling" },
  { value: "RWF", label: "RWF — Rwandan Franc" },
  { value: "USD", label: "USD — US Dollar" },
];

interface PaymentGatewaySettingsProps {
  readOnly?: boolean;
  targetUserId?: string;
}

export default function PaymentGatewaySettings({ readOnly = false, targetUserId }: PaymentGatewaySettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<GatewaySetting[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<GatewayType | "">("");
  const [currency, setCurrency] = useState("UGX");
  const [configForm, setConfigForm] = useState<GatewayConfig>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const userId = targetUserId || user?.id;

  useEffect(() => {
    if (userId) fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("payment_gateway_settings" as any)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSettings(data as unknown as GatewaySetting[]);
    }
    setIsLoading(false);
  };

  const handleGatewaySelect = (value: GatewayType) => {
    setSelectedGateway(value);
    setConfigForm({});
    setEditingId(null);
  };

  const handleEdit = (setting: GatewaySetting) => {
    setSelectedGateway(setting.gateway_type);
    setCurrency(setting.currency);
    setConfigForm(setting.gateway_config);
    setEditingId(setting.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!selectedGateway || !userId) return;

    const fields = GATEWAY_FIELDS[selectedGateway];
    const missing = fields.filter(f => !configForm[f.key]?.trim());
    if (missing.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in: ${missing.map(f => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const payload = {
      user_id: userId,
      gateway_type: selectedGateway,
      currency,
      gateway_config: configForm,
      is_active: true,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("payment_gateway_settings" as any)
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase
        .from("payment_gateway_settings" as any)
        .insert(payload));
    }

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate")
          ? "This gateway is already configured. Edit the existing one instead."
          : "Failed to save payment gateway settings",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Payment gateway configured successfully" });
    setSelectedGateway("");
    setConfigForm({});
    setEditingId(null);
    fetchSettings();
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("payment_gateway_settings" as any)
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      return;
    }
    fetchSettings();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this payment gateway configuration?")) return;
    const { error } = await supabase
      .from("payment_gateway_settings" as any)
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to remove gateway", variant: "destructive" });
      return;
    }
    toast({ title: "Removed", description: "Payment gateway removed" });
    fetchSettings();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const gatewayInfo = selectedGateway ? GATEWAY_OPTIONS.find(g => g.value === selectedGateway) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Payment Gateway Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure how you receive payments from customers via mobile money
          </p>
        </div>
      </div>

      {/* Existing Gateways */}
      {settings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Configured Gateways
          </h4>
          {settings.map((setting) => {
            const info = GATEWAY_OPTIONS.find(g => g.value === setting.gateway_type);
            return (
              <Card key={setting.id} className="border-border/50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        {info?.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{info?.label}</span>
                          <Badge variant={setting.is_active ? "default" : "secondary"} className="text-xs">
                            {setting.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{setting.currency}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Last updated: {new Date(setting.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={setting.is_active}
                          onCheckedChange={() => handleToggleActive(setting.id, setting.is_active)}
                        />
                        <Button size="sm" variant="outline" onClick={() => handleEdit(setting)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(setting.id)}>
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Gateway Form */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? "Edit Gateway Configuration" : "Add Payment Gateway"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Update your gateway credentials below"
                : "Select a payment gateway and enter your credentials to start receiving payments"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Gateway Selection */}
            <div className="grid gap-3">
              <Label>Select Payment Gateway</Label>
              <div className="grid sm:grid-cols-3 gap-3">
                {GATEWAY_OPTIONS.map((gw) => {
                  const isConfigured = settings.some(s => s.gateway_type === gw.value && s.id !== editingId);
                  return (
                    <button
                      key={gw.value}
                      type="button"
                      disabled={isConfigured}
                      onClick={() => handleGatewaySelect(gw.value)}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                        selectedGateway === gw.value
                          ? "border-primary bg-primary/5"
                          : isConfigured
                          ? "border-border/30 opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary/50 cursor-pointer"
                      }`}
                    >
                      {isConfigured && (
                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-green-500" />
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        {gw.icon}
                        <span className="font-medium text-sm">{gw.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{gw.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency Selection */}
            {selectedGateway && (
              <>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gateway-specific fields */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{gatewayInfo?.label} Configuration</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {GATEWAY_FIELDS[selectedGateway].map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>{field.label} *</Label>
                        <Input
                          id={field.key}
                          type={field.type || "text"}
                          value={configForm[field.key] || ""}
                          onChange={(e) => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="mt-1.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Banner */}
                <div className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">How it works</p>
                    <p>
                      When a customer makes a purchase, the payment is processed through {gatewayInfo?.label} and 
                      deposited directly to your wallet. Both you and the customer will receive confirmation 
                      via SMS and email.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? "Update Gateway" : "Save Gateway"}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedGateway("");
                        setConfigForm({});
                        setEditingId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
