import { type MCPServerInfo } from './detection'

export interface TroubleshootingStep {
  title: string
  description: string
  action?: 'button' | 'link' | 'copy' | 'check'
  actionLabel?: string
  actionData?: string
  completed?: boolean
}

export interface TroubleshootingSolution {
  title: string
  description: string
  steps: TroubleshootingStep[]
  priority: 'high' | 'medium' | 'low'
  category: 'connection' | 'authentication' | 'installation' | 'configuration' | 'system'
}

export interface ErrorAnalysis {
  errorType: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  possibleCauses: string[]
  solutions: TroubleshootingSolution[]
  quickFix?: TroubleshootingStep
}

export class MCPTroubleshootingService {
  
  /**
   * Analyze an error and provide troubleshooting solutions
   */
  analyzeError(error: Error | string, context?: {
    step?: string
    serverInfo?: MCPServerInfo
    provider?: string
  }): ErrorAnalysis {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorLower = errorMessage.toLowerCase()

    // Connection errors
    if (this.isConnectionError(errorLower)) {
      return this.createConnectionErrorAnalysis(errorMessage, context)
    }

    // OAuth/Authentication errors
    if (this.isAuthError(errorLower)) {
      return this.createAuthErrorAnalysis(errorMessage, context)
    }

    // Installation errors
    if (this.isInstallationError(errorLower)) {
      return this.createInstallationErrorAnalysis(errorMessage, context)
    }

    // URL/Detection errors
    if (this.isDetectionError(errorLower)) {
      return this.createDetectionErrorAnalysis(errorMessage, context)
    }

    // Permission errors
    if (this.isPermissionError(errorLower)) {
      return this.createPermissionErrorAnalysis(errorMessage, context)
    }

    // Generic error fallback
    return this.createGenericErrorAnalysis(errorMessage, context)
  }

  /**
   * Check system requirements
   */
  checkSystemRequirements(): Promise<{
    node: { installed: boolean, version?: string, requirement: string }
    npm: { installed: boolean, version?: string, requirement: string }
    internet: { connected: boolean }
    permissions: { canInstallGlobal: boolean }
  }> {
    return new Promise((resolve) => {
      // This would normally check actual system requirements
      // For now, we'll simulate the checks
      resolve({
        node: { installed: true, version: '18.0.0', requirement: '>=16.0.0' },
        npm: { installed: true, version: '9.0.0', requirement: '>=8.0.0' },
        internet: { connected: navigator.onLine },
        permissions: { canInstallGlobal: false } // Assume no global permissions by default
      })
    })
  }

  /**
   * Get common solutions for MCP setup
   */
  getCommonSolutions(): TroubleshootingSolution[] {
    return [
      {
        title: 'Enable Pop-ups',
        description: 'OAuth authentication requires pop-up windows',
        priority: 'high',
        category: 'authentication',
        steps: [
          {
            title: 'Check browser settings',
            description: 'Make sure pop-ups are enabled for this site',
            action: 'check'
          },
          {
            title: 'Try again',
            description: 'Click the OAuth button again after enabling pop-ups',
            action: 'button',
            actionLabel: 'Retry OAuth'
          }
        ]
      },
      {
        title: 'Install Node.js',
        description: 'MCP servers require Node.js to be installed',
        priority: 'high',
        category: 'system',
        steps: [
          {
            title: 'Download Node.js',
            description: 'Install Node.js version 16 or higher',
            action: 'link',
            actionLabel: 'Download Node.js',
            actionData: 'https://nodejs.org/download'
          },
          {
            title: 'Restart browser',
            description: 'Close and reopen your browser after installing',
            action: 'check'
          }
        ]
      },
      {
        title: 'Fix Network Issues',
        description: 'Connection problems can prevent MCP setup',
        priority: 'medium',
        category: 'connection',
        steps: [
          {
            title: 'Check internet connection',
            description: 'Make sure you have a stable internet connection',
            action: 'check'
          },
          {
            title: 'Disable VPN/Proxy',
            description: 'Try disabling VPN or proxy temporarily',
            action: 'check'
          },
          {
            title: 'Try different network',
            description: 'Switch to a different network if available',
            action: 'check'
          }
        ]
      }
    ]
  }

  // Private methods for error detection
  private isConnectionError(error: string): boolean {
    return error.includes('network') ||
           error.includes('connection') ||
           error.includes('timeout') ||
           error.includes('fetch') ||
           error.includes('cors')
  }

  private isAuthError(error: string): boolean {
    return error.includes('oauth') ||
           error.includes('authorization') ||
           error.includes('token') ||
           error.includes('authentication') ||
           error.includes('access denied') ||
           error.includes('unauthorized')
  }

  private isInstallationError(error: string): boolean {
    return error.includes('npm') ||
           error.includes('install') ||
           error.includes('package') ||
           error.includes('node') ||
           error.includes('command not found') ||
           error.includes('permission denied')
  }

  private isDetectionError(error: string): boolean {
    return error.includes('detect') ||
           error.includes('parse') ||
           error.includes('invalid url') ||
           error.includes('not found') ||
           error.includes('repository')
  }

  private isPermissionError(error: string): boolean {
    return error.includes('permission') ||
           error.includes('access denied') ||
           error.includes('eacces') ||
           error.includes('eperm')
  }

  // Private methods for creating error analyses
  private createConnectionErrorAnalysis(error: string, context?: any): ErrorAnalysis {
    return {
      errorType: 'connection',
      severity: 'critical',
      message: 'Network connection failed',
      possibleCauses: [
        'No internet connection',
        'Firewall blocking requests',
        'VPN/Proxy interference',
        'Server temporarily unavailable'
      ],
      solutions: [
        {
          title: 'Check Network Connection',
          description: 'Verify your internet connection and network settings',
          priority: 'high',
          category: 'connection',
          steps: [
            {
              title: 'Test internet connection',
              description: 'Try opening other websites',
              action: 'check'
            },
            {
              title: 'Disable VPN/Proxy',
              description: 'Temporarily disable VPN or proxy settings',
              action: 'check'
            },
            {
              title: 'Try different network',
              description: 'Connect to a different Wi-Fi network if available',
              action: 'check'
            }
          ]
        }
      ],
      quickFix: {
        title: 'Quick Fix',
        description: 'Retry the connection',
        action: 'button',
        actionLabel: 'Retry Connection'
      }
    }
  }

  private createAuthErrorAnalysis(error: string, context?: any): ErrorAnalysis {
    const isPopupBlocked = error.includes('popup') || error.includes('blocked')
    const isAccessDenied = error.includes('access denied') || error.includes('denied')

    return {
      errorType: 'authentication',
      severity: isPopupBlocked ? 'warning' : 'critical',
      message: isPopupBlocked ? 'Pop-up was blocked' : isAccessDenied ? 'OAuth access denied' : 'Authentication failed',
      possibleCauses: [
        'Pop-up blocker enabled',
        'User denied OAuth access',
        'Invalid OAuth configuration',
        'Network interruption during auth flow'
      ],
      solutions: [
        {
          title: 'Enable Pop-ups',
          description: 'Allow pop-ups for OAuth authentication',
          priority: 'high',
          category: 'authentication',
          steps: [
            {
              title: 'Allow pop-ups',
              description: 'Click the pop-up blocked icon in your address bar and allow pop-ups',
              action: 'check'
            },
            {
              title: 'Retry authentication',
              description: 'Try the OAuth flow again',
              action: 'button',
              actionLabel: 'Retry OAuth'
            }
          ]
        }
      ],
      quickFix: {
        title: 'Allow Pop-ups',
        description: 'Enable pop-ups and try again',
        action: 'button',
        actionLabel: 'Retry OAuth'
      }
    }
  }

  private createInstallationErrorAnalysis(error: string, context?: any): ErrorAnalysis {
    const needsNode = error.includes('node') || error.includes('npm')
    const permissionIssue = error.includes('permission') || error.includes('eacces')

    return {
      errorType: 'installation',
      severity: 'critical',
      message: needsNode ? 'Node.js not found' : permissionIssue ? 'Permission denied' : 'Installation failed',
      possibleCauses: [
        'Node.js not installed',
        'npm not available',
        'Insufficient permissions',
        'Network issues during download'
      ],
      solutions: [
        {
          title: 'Install Node.js',
          description: 'Install Node.js and npm',
          priority: 'high',
          category: 'system',
          steps: [
            {
              title: 'Download Node.js',
              description: 'Install the latest LTS version',
              action: 'link',
              actionLabel: 'Download Node.js',
              actionData: 'https://nodejs.org/download'
            },
            {
              title: 'Restart browser',
              description: 'Close and reopen your browser',
              action: 'check'
            }
          ]
        }
      ]
    }
  }

  private createDetectionErrorAnalysis(error: string, context?: any): ErrorAnalysis {
    return {
      errorType: 'detection',
      severity: 'warning',
      message: 'Could not detect MCP server',
      possibleCauses: [
        'URL is not an MCP server',
        'Repository is private',
        'Invalid URL format',
        'Server configuration missing'
      ],
      solutions: [
        {
          title: 'Verify URL',
          description: 'Make sure the URL points to an MCP server',
          priority: 'high',
          category: 'configuration',
          steps: [
            {
              title: 'Check URL format',
              description: 'Use a GitHub repository URL like: https://github.com/user/repo',
              action: 'check'
            },
            {
              title: 'Verify it\'s an MCP server',
              description: 'Make sure the repository contains an MCP server implementation',
              action: 'check'
            },
            {
              title: 'Browse MCP servers',
              description: 'Find official MCP servers',
              action: 'link',
              actionLabel: 'Browse Servers',
              actionData: 'https://github.com/modelcontextprotocol/servers'
            }
          ]
        }
      ]
    }
  }

  private createPermissionErrorAnalysis(error: string, context?: any): ErrorAnalysis {
    return {
      errorType: 'permission',
      severity: 'critical',
      message: 'Permission denied',
      possibleCauses: [
        'Insufficient system permissions',
        'Admin rights required',
        'File system restrictions',
        'Corporate security policies'
      ],
      solutions: [
        {
          title: 'Use Cloud Bridge',
          description: 'Skip local installation with our cloud service',
          priority: 'high',
          category: 'installation',
          steps: [
            {
              title: 'Try Cloud Bridge',
              description: 'We can run the MCP server in the cloud for you',
              action: 'button',
              actionLabel: 'Use Cloud Bridge'
            }
          ]
        }
      ]
    }
  }

  private createGenericErrorAnalysis(error: string, context?: any): ErrorAnalysis {
    return {
      errorType: 'unknown',
      severity: 'warning',
      message: 'An unexpected error occurred',
      possibleCauses: [
        'Temporary service issue',
        'Browser compatibility problem',
        'Network connectivity issue'
      ],
      solutions: [
        {
          title: 'Basic Troubleshooting',
          description: 'Try these common solutions',
          priority: 'medium',
          category: 'system',
          steps: [
            {
              title: 'Refresh the page',
              description: 'Reload the page and try again',
              action: 'button',
              actionLabel: 'Refresh Page'
            },
            {
              title: 'Clear browser cache',
              description: 'Clear your browser cache and cookies',
              action: 'check'
            },
            {
              title: 'Try different browser',
              description: 'Test with Chrome, Firefox, or Safari',
              action: 'check'
            }
          ]
        }
      ]
    }
  }
}

export const troubleshootingService = new MCPTroubleshootingService()