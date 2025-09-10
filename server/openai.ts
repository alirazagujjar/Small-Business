import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface BusinessInsight {
  type: 'recommendation' | 'alert' | 'forecast';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  data?: any;
}

export interface SalesAnalysis {
  trends: string[];
  recommendations: string[];
  forecasts: {
    nextMonth: number;
    confidence: number;
  };
  risks: string[];
}

export interface InventoryAnalysis {
  stockoutPredictions: Array<{
    productId: string;
    productName: string;
    daysUntilStockout: number;
    confidence: number;
  }>;
  reorderRecommendations: Array<{
    productId: string;
    productName: string;
    recommendedQuantity: number;
    vendorId?: string;
  }>;
  slowMovingProducts: string[];
}

export class AIService {
  async generateBusinessInsights(salesData: any[], inventoryData: any[]): Promise<BusinessInsight[]> {
    try {
      const prompt = `
        Analyze the following business data and provide actionable insights:
        
        Sales Data: ${JSON.stringify(salesData)}
        Inventory Data: ${JSON.stringify(inventoryData)}
        
        Generate business insights in the following JSON format:
        {
          "insights": [
            {
              "type": "recommendation|alert|forecast",
              "title": "Brief title",
              "description": "Detailed description with specific actions",
              "priority": "low|medium|high",
              "actionable": true|false,
              "data": {}
            }
          ]
        }
        
        Focus on:
        1. Inventory management (low stock, overstocking, reorder points)
        2. Sales trends and forecasting
        3. Customer behavior patterns
        4. Operational efficiency improvements
        5. Revenue optimization opportunities
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an AI business analyst expert. Provide actionable insights based on business data. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
      return result.insights || [];
    } catch (error) {
      console.error('Error generating business insights:', error);
      return [];
    }
  }

  async analyzeSalesPerformance(salesData: any[]): Promise<SalesAnalysis> {
    try {
      const prompt = `
        Analyze the following sales data and provide insights:
        
        Sales Data: ${JSON.stringify(salesData)}
        
        Provide analysis in the following JSON format:
        {
          "trends": ["trend1", "trend2"],
          "recommendations": ["rec1", "rec2"],
          "forecasts": {
            "nextMonth": 12345,
            "confidence": 0.85
          },
          "risks": ["risk1", "risk2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a sales analytics expert. Analyze sales data and provide insights in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        trends: result.trends || [],
        recommendations: result.recommendations || [],
        forecasts: result.forecasts || { nextMonth: 0, confidence: 0 },
        risks: result.risks || []
      };
    } catch (error) {
      console.error('Error analyzing sales performance:', error);
      return {
        trends: [],
        recommendations: [],
        forecasts: { nextMonth: 0, confidence: 0 },
        risks: []
      };
    }
  }

  async analyzeInventoryOptimization(inventoryData: any[], salesHistory: any[]): Promise<InventoryAnalysis> {
    try {
      const prompt = `
        Analyze inventory and sales data for optimization opportunities:
        
        Inventory Data: ${JSON.stringify(inventoryData)}
        Sales History: ${JSON.stringify(salesHistory)}
        
        Provide analysis in JSON format:
        {
          "stockoutPredictions": [
            {
              "productId": "id",
              "productName": "name", 
              "daysUntilStockout": 5,
              "confidence": 0.9
            }
          ],
          "reorderRecommendations": [
            {
              "productId": "id",
              "productName": "name",
              "recommendedQuantity": 50,
              "vendorId": "vendor_id"
            }
          ],
          "slowMovingProducts": ["product1", "product2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an inventory optimization expert. Analyze data and provide recommendations in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        stockoutPredictions: result.stockoutPredictions || [],
        reorderRecommendations: result.reorderRecommendations || [],
        slowMovingProducts: result.slowMovingProducts || []
      };
    } catch (error) {
      console.error('Error analyzing inventory:', error);
      return {
        stockoutPredictions: [],
        reorderRecommendations: [],
        slowMovingProducts: []
      };
    }
  }

  async generateProductRecommendations(customerData: any, purchaseHistory: any[]): Promise<string[]> {
    try {
      const prompt = `
        Based on customer data and purchase history, recommend products:
        
        Customer: ${JSON.stringify(customerData)}
        Purchase History: ${JSON.stringify(purchaseHistory)}
        
        Provide recommendations in JSON format:
        {
          "recommendations": ["product1", "product2", "product3"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a product recommendation expert. Analyze customer data and suggest relevant products."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating product recommendations:', error);
      return [];
    }
  }

  async analyzePricingStrategy(productData: any, competitorData?: any): Promise<any> {
    try {
      const prompt = `
        Analyze pricing strategy for the following product:
        
        Product Data: ${JSON.stringify(productData)}
        ${competitorData ? `Competitor Data: ${JSON.stringify(competitorData)}` : ''}
        
        Provide pricing analysis in JSON format:
        {
          "currentPricing": {
            "assessment": "optimal|underpriced|overpriced",
            "confidence": 0.85
          },
          "recommendations": {
            "suggestedPrice": 29.99,
            "reasoning": "explanation",
            "expectedImpact": "increased revenue by 15%"
          },
          "competitivePosition": "strong|average|weak"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a pricing strategy expert. Analyze product pricing and provide optimization recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error analyzing pricing strategy:', error);
      return {};
    }
  }
}

export const aiService = new AIService();
