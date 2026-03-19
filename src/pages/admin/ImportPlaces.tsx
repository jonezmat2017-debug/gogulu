import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ImportPlaces() {
  const [location, setLocation] = useState("City");
  const [category, setCategory] = useState("restaurant");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const categories = [
    { value: "restaurant", label: "Eating Places" },
    { value: "night_club", label: "Night Spots" },
    { value: "bar", label: "Bars" },
    { value: "cafe", label: "Cafes" },
  ];

  const handleImport = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("import-google-places", {
        body: { location, placeType: category },
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.places || []);
        toast({
          title: "Success",
          description: `Found ${data.places?.length || 0} places. ${data.imported || 0} imported successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to import places",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to import places from Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Places from Google</h1>
        <p className="text-muted-foreground">
          Fetch and import venues from Google Places API
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
          <CardDescription>
            Configure the search to find places in Gulu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleImport} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import from Google Places
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              {results.length} places found and processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((place, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{place.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {place.address}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {place.rating && (
                        <Badge variant="secondary">
                          ⭐ {place.rating}
                        </Badge>
                      )}
                      {place.priceLevel && (
                        <Badge variant="outline">
                          {"$".repeat(place.priceLevel)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
