import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Target, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIFeatures() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adContent, setAdContent] = useState("");
  const [recommendations, setRecommendations] = useState<any>(null);
  const [reviewAnalysis, setReviewAnalysis] = useState<any>(null);

  // Ad Generator State
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  // Recommendations State
  const [userPreferences, setUserPreferences] = useState("");

  // Review Analysis State
  const [entityId, setEntityId] = useState("");
  const [entityType, setEntityType] = useState<"product" | "venue">("product");

  const generateAd = async () => {
    if (!productName || !description) {
      toast({
        title: "Missing Information",
        description: "Please provide product name and description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ad', {
        body: { productName, description, category, targetAudience }
      });

      if (error) throw error;

      setAdContent(data.adContent);
      toast({
        title: "Ad Generated!",
        description: "AI has created your advertisement",
      });
    } catch (error) {
      console.error('Error generating ad:', error);
      toast({
        title: "Error",
        description: "Failed to generate ad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { userPreferences }
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      toast({
        title: "Recommendations Generated!",
        description: "AI has created personalized recommendations",
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeReviews = async () => {
    if (!entityId) {
      toast({
        title: "Missing Information",
        description: "Please provide an entity ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-reviews', {
        body: entityType === "product" ? { productId: entityId } : { venueId: entityId }
      });

      if (error) throw error;

      setReviewAnalysis(data.analysis);
      toast({
        title: "Analysis Complete!",
        description: "AI has analyzed the reviews",
      });
    } catch (error) {
      console.error('Error analyzing reviews:', error);
      toast({
        title: "Error",
        description: "Failed to analyze reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI-Powered Features</h1>
        <p className="text-muted-foreground">
          Leverage AI to generate ads, recommendations, and analyze reviews
        </p>
      </div>

      <Tabs defaultValue="ads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ads">
            <Sparkles className="h-4 w-4 mr-2" />
            Ad Generator
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Target className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <MessageSquare className="h-4 w-4 mr-2" />
            Review Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>AI Ad Generator</CardTitle>
              <CardDescription>
                Generate compelling advertisements for products and venues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product/Venue Name</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product/venue"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Food, Fashion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Young professionals"
                  />
                </div>
              </div>

              <Button onClick={generateAd} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Ad
              </Button>

              {adContent && (
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">Generated Advertisement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{adContent}</div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations Engine</CardTitle>
              <CardDescription>
                Generate personalized recommendations for new users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferences">User Preferences (Optional)</Label>
                <Textarea
                  id="preferences"
                  value={userPreferences}
                  onChange={(e) => setUserPreferences(e.target.value)}
                  placeholder="e.g., Likes spicy food, prefers outdoor activities"
                  rows={3}
                />
              </div>

              <Button onClick={getRecommendations} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Recommendations
              </Button>

              {recommendations && (
                <div className="space-y-4">
                  {recommendations.products?.length > 0 && (
                    <Card className="bg-muted">
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {recommendations.products.map((item: any, index: number) => (
                            <li key={index} className="border-b pb-2 last:border-0">
                              <div className="font-medium">Product ID: {item.id}</div>
                              <div className="text-sm text-muted-foreground">{item.reason}</div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {recommendations.venues?.length > 0 && (
                    <Card className="bg-muted">
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended Venues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {recommendations.venues.map((item: any, index: number) => (
                            <li key={index} className="border-b pb-2 last:border-0">
                              <div className="font-medium">Venue ID: {item.id}</div>
                              <div className="text-sm text-muted-foreground">{item.reason}</div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review Analysis</CardTitle>
              <CardDescription>
                AI-powered sentiment analysis and insights from customer reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entityType">Type</Label>
                <div className="flex gap-4">
                  <Button
                    variant={entityType === "product" ? "default" : "outline"}
                    onClick={() => setEntityType("product")}
                  >
                    Product
                  </Button>
                  <Button
                    variant={entityType === "venue" ? "default" : "outline"}
                    onClick={() => setEntityType("venue")}
                  >
                    Venue
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entityId">{entityType === "product" ? "Product" : "Venue"} ID</Label>
                <Input
                  id="entityId"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder="Enter ID"
                />
              </div>

              <Button onClick={analyzeReviews} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Reviews
              </Button>

              {reviewAnalysis && (
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-medium mb-1">Sentiment</div>
                      <div className="text-sm capitalize">{reviewAnalysis.sentiment}</div>
                    </div>

                    <div>
                      <div className="font-medium mb-1">Summary</div>
                      <div className="text-sm">{reviewAnalysis.summary}</div>
                    </div>

                    {reviewAnalysis.keyThemes?.length > 0 && (
                      <div>
                        <div className="font-medium mb-1">Key Themes</div>
                        <ul className="text-sm list-disc list-inside">
                          {reviewAnalysis.keyThemes.map((theme: string, index: number) => (
                            <li key={index}>{theme}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {reviewAnalysis.suggestions?.length > 0 && (
                      <div>
                        <div className="font-medium mb-1">Suggestions</div>
                        <ul className="text-sm list-disc list-inside">
                          {reviewAnalysis.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
