import { z } from 'zod'

// Types for MCP server detection
export interface MCPServerInfo {
  id: string
  name: string
  description: string
  version?: string
  author?: string
  homepage?: string
  repository?: string
  
  // Installation details
  installCommand: string
  installArgs: string[]
  
  // Runtime configuration
  command: string
  args: string[]
  env: Record<string, string>
  
  // Requirements
  requiresAuth: boolean
  authProviders: OAuthProvider[]
  requiredEnvVars: EnvVarInfo[]
  
  // Metadata
  category: MCPCategory
  tags: string[]
  icon?: string
  
  // Detection info
  source: 'github' | 'npm' | 'manual'
  sourceUrl: string
  confidence: number // 0-1 score of how confident we are this is an MCP server
}

export interface OAuthProvider {
  name: 'github' | 'notion' | 'linear' | 'jira' | 'figma' | 'custom'
  displayName: string
  scopes: string[]
  instructions?: string
}

export interface EnvVarInfo {
  name: string
  description: string
  required: boolean
  example?: string
  source?: 'oauth' | 'manual'
}

export type MCPCategory = 
  | 'developer-tools' 
  | 'project-management' 
  | 'design' 
  | 'communication'
  | 'database'
  | 'filesystem'
  | 'search'
  | 'other'

// Validation schema for package.json MCP servers
const PackageJsonSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
  author: z.union([z.string(), z.object({ name: z.string() })]).optional(),
  homepage: z.string().optional(),
  repository: z.union([
    z.string(),
    z.object({ url: z.string() })
  ]).optional(),
  bin: z.record(z.string()).optional(),
  main: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

export class MCPDetectionService {
  private readonly GITHUB_API_BASE = 'https://api.github.com'
  private readonly NPM_API_BASE = 'https://registry.npmjs.org'

  /**
   * Detect MCP server from URL
   */
  async detectFromUrl(url: string): Promise<MCPServerInfo | null> {
    try {
      const urlObj = new URL(url)
      
      if (urlObj.hostname === 'github.com') {
        return await this.detectFromGitHub(url)
      } else if (urlObj.hostname === 'www.npmjs.com' || urlObj.hostname === 'npmjs.com') {
        return await this.detectFromNpm(url)
      }
      
      return null
    } catch (error) {
      console.error('URL detection failed:', error)
      return null
    }
  }

  /**
   * Detect MCP server from GitHub repository
   */
  private async detectFromGitHub(url: string): Promise<MCPServerInfo | null> {
    try {
      // Parse GitHub URL
      const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/)
      if (!match) return null

      const [, owner, repo] = match
      const cleanRepo = repo.replace(/\.git$/, '')

      // Fetch repository info
      const repoResponse = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${cleanRepo}`)
      if (!repoResponse.ok) return null
      const repoData = await repoResponse.json()

      // Fetch package.json
      const packageResponse = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${cleanRepo}/contents/package.json`)
      if (!packageResponse.ok) return null
      const packageData = await packageResponse.json()
      
      const packageContent = JSON.parse(atob(packageData.content))
      const validated = PackageJsonSchema.parse(packageContent)

      // Check if it's likely an MCP server
      const confidence = this.calculateMCPConfidence(validated, repoData)
      if (confidence < 0.5) return null

      // Fetch README for additional context
      let readmeContent = ''
      try {
        const readmeResponse = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${cleanRepo}/readme`)
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json()
          readmeContent = atob(readmeData.content)
        }
      } catch (e) {
        // README is optional
      }

      // Extract setup requirements from README
      const requirements = this.extractRequirements(readmeContent, validated)

      return {
        id: `${owner}-${cleanRepo}`.toLowerCase(),
        name: repoData.name,
        description: repoData.description || validated.description || 'MCP Server',
        version: validated.version,
        author: typeof validated.author === 'string' ? validated.author : validated.author?.name,
        homepage: repoData.html_url,
        repository: repoData.clone_url,
        
        // Installation (assume npm install from git)
        installCommand: 'npx',
        installArgs: ['-y', `${owner}/${cleanRepo}`],
        
        // Runtime configuration
        command: 'npx',
        args: ['-y', `${owner}/${cleanRepo}`],
        env: requirements.env,
        
        // Requirements
        requiresAuth: requirements.requiresAuth,
        authProviders: requirements.authProviders,
        requiredEnvVars: requirements.envVars,
        
        // Metadata
        category: this.categorizeServer(validated, repoData),
        tags: validated.keywords || [],
        icon: this.getIconForCategory(this.categorizeServer(validated, repoData)),
        
        // Detection info
        source: 'github',
        sourceUrl: url,
        confidence
      }

    } catch (error) {
      console.error('GitHub detection failed:', error)
      return null
    }
  }

  /**
   * Detect MCP server from npm package
   */
  private async detectFromNpm(url: string): Promise<MCPServerInfo | null> {
    try {
      // Parse npm URL to get package name
      const match = url.match(/npmjs\.com\/package\/([^\/\?#]+)/)
      if (!match) return null

      const [, packageName] = match

      // Fetch package info from npm registry
      const response = await fetch(`${this.NPM_API_BASE}/${packageName}/latest`)
      if (!response.ok) return null
      
      const packageData = await response.json()
      const validated = PackageJsonSchema.parse(packageData)

      // Check if it's likely an MCP server
      const confidence = this.calculateMCPConfidence(validated, packageData)
      if (confidence < 0.5) return null

      // Extract repository URL for README
      let readmeContent = ''
      if (packageData.readme) {
        readmeContent = packageData.readme
      }

      const requirements = this.extractRequirements(readmeContent, validated)

      return {
        id: packageName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        name: validated.name,
        description: validated.description || 'MCP Server',
        version: validated.version,
        author: typeof validated.author === 'string' ? validated.author : validated.author?.name,
        homepage: validated.homepage,
        repository: typeof validated.repository === 'string' ? validated.repository : validated.repository?.url,
        
        // Installation
        installCommand: 'npm',
        installArgs: ['install', '-g', packageName],
        
        // Runtime configuration
        command: packageName,
        args: [],
        env: requirements.env,
        
        // Requirements
        requiresAuth: requirements.requiresAuth,
        authProviders: requirements.authProviders,
        requiredEnvVars: requirements.envVars,
        
        // Metadata
        category: this.categorizeServer(validated, packageData),
        tags: validated.keywords || [],
        icon: this.getIconForCategory(this.categorizeServer(validated, packageData)),
        
        // Detection info
        source: 'npm',
        sourceUrl: url,
        confidence
      }

    } catch (error) {
      console.error('npm detection failed:', error)
      return null
    }
  }

  /**
   * Calculate confidence score that this is an MCP server
   */
  private calculateMCPConfidence(pkg: any, repo?: any): number {
    let score = 0

    // Check package name
    if (pkg.name?.includes('mcp')) score += 0.4
    if (pkg.name?.includes('modelcontextprotocol')) score += 0.4
    if (pkg.name?.includes('server')) score += 0.2

    // Check description
    if (pkg.description?.toLowerCase().includes('mcp')) score += 0.3
    if (pkg.description?.toLowerCase().includes('model context protocol')) score += 0.3
    if (pkg.description?.toLowerCase().includes('context server')) score += 0.2

    // Check keywords
    if (pkg.keywords?.includes('mcp')) score += 0.3
    if (pkg.keywords?.includes('modelcontextprotocol')) score += 0.3

    // Check if it's in the official MCP org
    if (repo?.owner?.login === 'modelcontextprotocol') score += 0.5

    // Check for MCP-related dependencies
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    if (deps['@modelcontextprotocol/sdk']) score += 0.4

    return Math.min(score, 1.0)
  }

  /**
   * Extract setup requirements from README and package.json
   */
  private extractRequirements(readme: string, pkg: any): {
    requiresAuth: boolean
    authProviders: OAuthProvider[]
    envVars: EnvVarInfo[]
    env: Record<string, string>
  } {
    const authProviders: OAuthProvider[] = []
    const envVars: EnvVarInfo[] = []
    const env: Record<string, string> = {}
    
    const readmeLower = readme.toLowerCase()

    // Detect GitHub integration
    if (readmeLower.includes('github') && (readmeLower.includes('token') || readmeLower.includes('oauth'))) {
      authProviders.push({
        name: 'github',
        displayName: 'GitHub',
        scopes: ['repo', 'read:user'],
        instructions: 'Access to repositories and user information'
      })
      envVars.push({
        name: 'GITHUB_TOKEN',
        description: 'GitHub personal access token',
        required: true,
        source: 'oauth'
      })
    }

    // Detect Notion integration
    if (readmeLower.includes('notion')) {
      authProviders.push({
        name: 'notion',
        displayName: 'Notion',
        scopes: ['read_content', 'read_user_with_email'],
        instructions: 'Access to Notion pages and databases'
      })
      envVars.push({
        name: 'NOTION_API_KEY',
        description: 'Notion integration token',
        required: true,
        source: 'oauth'
      })
    }

    // Detect Linear integration
    if (readmeLower.includes('linear')) {
      authProviders.push({
        name: 'linear',
        displayName: 'Linear',
        scopes: ['read'],
        instructions: 'Access to Linear issues and projects'
      })
      envVars.push({
        name: 'LINEAR_API_KEY',
        description: 'Linear API key',
        required: true,
        source: 'oauth'
      })
    }

    // Extract environment variables from README
    const envVarRegex = /([A-Z_]+).*?=.*?([^\n\r]+)/g
    let match
    while ((match = envVarRegex.exec(readme)) !== null) {
      const [, varName, description] = match
      if (!envVars.some(v => v.name === varName)) {
        envVars.push({
          name: varName,
          description: description.trim(),
          required: readme.includes(`${varName} (required)`) || readme.includes(`Required: ${varName}`)
        })
      }
    }

    return {
      requiresAuth: authProviders.length > 0,
      authProviders,
      envVars,
      env
    }
  }

  /**
   * Categorize the MCP server
   */
  private categorizeServer(pkg: any, repo?: any): MCPCategory {
    const text = `${pkg.name} ${pkg.description} ${pkg.keywords?.join(' ') || ''}`.toLowerCase()

    if (text.includes('github') || text.includes('git') || text.includes('code')) {
      return 'developer-tools'
    }
    if (text.includes('notion') || text.includes('linear') || text.includes('jira') || text.includes('project')) {
      return 'project-management'
    }
    if (text.includes('figma') || text.includes('design')) {
      return 'design'
    }
    if (text.includes('slack') || text.includes('discord') || text.includes('communication')) {
      return 'communication'
    }
    if (text.includes('database') || text.includes('sql') || text.includes('postgres') || text.includes('mysql')) {
      return 'database'
    }
    if (text.includes('filesystem') || text.includes('file') || text.includes('directory')) {
      return 'filesystem'
    }
    if (text.includes('search') || text.includes('brave') || text.includes('google')) {
      return 'search'
    }

    return 'other'
  }

  /**
   * Get icon for server category
   */
  private getIconForCategory(category: MCPCategory): string {
    const icons: Record<MCPCategory, string> = {
      'developer-tools': '🔧',
      'project-management': '📋',
      'design': '🎨',
      'communication': '💬',
      'database': '🗄️',
      'filesystem': '📁',
      'search': '🔍',
      'other': '🔗'
    }
    return icons[category]
  }
}