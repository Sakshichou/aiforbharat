import boto3
import json
from app.core.config import settings

class BedrockService:
    def __init__(self):
        self.client = boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)
        # Assuming model ID for Claude Sonnet (update according to latest AWS provisioned model ID for Sonnet 4.5/3.5)
        self.model_id = "anthropic.claude-3-5-sonnet-20240620-v1:0"

    def classify_issue(self, text: str) -> dict:
        """
        Calls Amazon Bedrock with Claude Sonnet to classify the issue
        """
        prompt = f"""
        Analyze the following civic issue report and classify it into a category such as: 
        Water, Road, Sanitation, Electricity, Public Nuisance, or Other.
        
        Report: "{text}"
        
        Return ONLY a complete JSON response in the following format and nothing else:
        {{
            "category": "Category Name",
            "confidence": 0.95,
            "reasoning": "Brief explanation"
        }}
        """

        try:
            # Bedrock Converse API format for Claude models
            response = self.client.converse(
                modelId=self.model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": prompt}]
                    }
                ],
                inferenceConfig={
                    "maxTokens": 200,
                    "temperature": 0.1
                }
            )
            
            response_text = response['output']['message']['content'][0]['text']
            
            # Extract JSON cleanly in case Claude adds surrounding text
            response_clean = response_text[response_text.find("{"):response_text.rfind("}")+1]
            return json.loads(response_clean)
            
        except Exception as e:
            print(f"Error calling Bedrock: {e}")
            return {
                "category": "Unknown",
                "confidence": 0.0,
                "reasoning": f"Failed to analyze: {str(e)}"
            }
