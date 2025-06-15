
# PromptVault API Documentation

## 🔗 Base URL
```
https://your-project.supabase.co/rest/v1
```

## 🔐 Authentication
All API requests require authentication using Supabase JWT tokens.

```javascript
// Headers required for all requests
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "apikey": "YOUR_SUPABASE_ANON_KEY",
  "Content-Type": "application/json"
}
```

## 📊 Database Schema

### Tables Overview
- `prompts` - Core prompt data
- `folders` - Folder organization
- `prompt_ratings` - Community ratings
- `prompt_copies` - Usage tracking
- `profiles` - User profiles

## 🚀 API Endpoints

### Prompts

#### GET /prompts
Retrieve all prompts for the authenticated user.

**Parameters:**
- `select` (string): Fields to return
- `order` (string): Sort order
- `limit` (number): Maximum results
- `offset` (number): Pagination offset

**Example Request:**
```javascript
const { data, error } = await supabase
  .from('prompts')
  .select('*')
  .eq('status', 'active')
  .order('updated_at', { ascending: false });
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Marketing Email Template",
      "description": "Template for promotional emails",
      "content": "Write a compelling marketing email...",
      "category": "Marketing",
      "tags": ["email", "marketing", "sales"],
      "platforms": ["ChatGPT", "Claude"],
      "variables": [
        {
          "name": "product_name",
          "type": "text",
          "description": "Name of the product"
        }
      ],
      "is_template": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /prompts
Create a new prompt.

**Request Body:**
```json
{
  "title": "New Prompt Title",
  "description": "Prompt description",
  "content": "The actual prompt content",
  "category": "Writing & Content",
  "tags": ["writing", "content"],
  "platforms": ["ChatGPT"],
  "variables": [],
  "is_template": false,
  "folder_id": null
}
```

#### PUT /prompts
Update an existing prompt.

**Request Body:** Same as POST with `id` field.

#### DELETE /prompts
Delete a prompt (sets status to 'deleted').

**Parameters:**
- `id` (string): Prompt ID to delete

### Folders

#### GET /folders
Retrieve folder structure.

```javascript
const { data, error } = await supabase
  .from('folders')
  .select('*')
  .order('name');
```

#### POST /folders
Create a new folder.

**Request Body:**
```json
{
  "name": "Folder Name",
  "parent_id": null,
  "color": "#3B82F6"
}
```

### Ratings

#### POST /prompt_ratings
Rate a community prompt.

**Request Body:**
```json
{
  "prompt_id": "uuid",
  "rating": 5,
  "comment": "Excellent prompt!"
}
```

#### GET /prompt_ratings
Get ratings for a prompt.

**Parameters:**
- `prompt_id` (string): Prompt ID

### Analytics

#### GET /analytics/usage
Get usage analytics for the authenticated user.

**Response:**
```json
{
  "total_prompts": 150,
  "prompts_created_this_month": 12,
  "most_used_category": "Development",
  "platform_usage": {
    "ChatGPT": 45,
    "Claude": 32,
    "Gemini": 18
  },
  "usage_over_time": [
    {
      "date": "2024-01-01",
      "count": 25
    }
  ]
}
```

## 🔒 Row Level Security (RLS) Policies

### Prompts Table
- **SELECT**: Users can view their own prompts and public community prompts
- **INSERT**: Users can create prompts for themselves
- **UPDATE**: Users can update their own prompts
- **DELETE**: Users can delete their own prompts

### Folders Table
- **SELECT**: Users can view their own folders
- **INSERT**: Users can create folders for themselves
- **UPDATE**: Users can update their own folders
- **DELETE**: Users can delete their own folders

### Ratings Table
- **SELECT**: All users can view ratings
- **INSERT**: Authenticated users can create ratings
- **UPDATE**: Users can update their own ratings
- **DELETE**: Users can delete their own ratings

## 📝 Data Types

### Prompt Variables
```typescript
interface PromptVariable {
  name: string;
  description: string;
  type: 'text' | 'select' | 'number';
  defaultValue?: string;
  options?: string[];
}
```

### Prompt Object
```typescript
interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  platforms: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  variables: PromptVariable[];
  is_template: boolean;
  folder_id: string | null;
  is_community: boolean;
  copy_count: number;
  average_rating: number | null;
  rating_count: number;
  is_featured: boolean;
  status: string;
  usage_count: number;
}
```

## 🔍 Search API

### POST /rpc/search_prompts
Advanced search functionality.

**Request Body:**
```json
{
  "search_query": "marketing email",
  "categories": ["Marketing", "Business"],
  "platforms": ["ChatGPT"],
  "tags": ["email"],
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Marketing Email Template",
      "description": "Template for promotional emails",
      "content": "Write a compelling marketing email...",
      "relevance_score": 0.95,
      "highlighted_content": "Write a compelling <mark>marketing email</mark>..."
    }
  ],
  "total_count": 1,
  "has_more": false
}
```

## 📊 Batch Operations

### POST /rpc/bulk_update_prompts
Update multiple prompts at once.

**Request Body:**
```json
{
  "prompt_ids": ["uuid1", "uuid2", "uuid3"],
  "updates": {
    "category": "Updated Category",
    "tags": ["new", "tags"]
  }
}
```

### POST /rpc/bulk_delete_prompts
Delete multiple prompts.

**Request Body:**
```json
{
  "prompt_ids": ["uuid1", "uuid2", "uuid3"]
}
```

## 📤 Export API

### GET /rpc/export_prompts
Export prompts in various formats.

**Parameters:**
- `format` (string): 'json' | 'csv' | 'markdown'
- `folder_id` (string, optional): Export specific folder
- `include_community` (boolean): Include community prompts

**Response:**
```json
{
  "data": "exported_content",
  "format": "json",
  "exported_at": "2024-01-01T00:00:00Z",
  "prompt_count": 150
}
```

## 🔔 Webhooks

### Community Prompt Notifications
```json
{
  "event": "prompt.community.new",
  "data": {
    "prompt_id": "uuid",
    "title": "New Community Prompt",
    "author": "username",
    "category": "Development"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Rating Notifications
```json
{
  "event": "prompt.rated",
  "data": {
    "prompt_id": "uuid",
    "rating": 5,
    "new_average": 4.8,
    "rating_count": 25
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Error Codes
- `PROMPT_NOT_FOUND` - Prompt doesn't exist or no access
- `INVALID_CATEGORY` - Category doesn't exist
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions

## 📈 Rate Limits

- **Standard API calls**: 1000 requests per hour
- **Search API**: 100 requests per hour
- **Bulk operations**: 10 requests per hour
- **Export API**: 5 requests per hour

## 🔧 SDK Usage Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Create a prompt
const { data, error } = await supabase
  .from('prompts')
  .insert({
    title: 'New Prompt',
    content: 'Prompt content',
    category: 'Development'
  });

// Search prompts
const { data: searchResults } = await supabase
  .rpc('search_prompts', {
    search_query: 'react component',
    limit: 10
  });
```

### Python
```python
from supabase import create_client, Client

supabase: Client = create_client(
    "YOUR_SUPABASE_URL",
    "YOUR_SUPABASE_ANON_KEY"
)

# Create a prompt
response = supabase.table('prompts').insert({
    'title': 'New Prompt',
    'content': 'Prompt content',
    'category': 'Development'
}).execute()

# Get user prompts
prompts = supabase.table('prompts').select('*').eq('user_id', user_id).execute()
```

## 🧪 Testing

### Test Environment
Base URL: `https://your-project-test.supabase.co/rest/v1`

### Sample Test Data
Use the `/rpc/create_test_data` endpoint to populate your test environment with sample prompts and folders.

---

**Need help?** Contact our developer support at [dev-support@promptvault.com](mailto:dev-support@promptvault.com)
