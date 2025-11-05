import React, { useState } from 'react';
import { Github, Key, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

export default function GitHubAuth({ onAuth, onCancel, theme }) {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [repoName, setRepoName] = useState('hdl-workspace');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !username || !repoName) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      // Verify token and username
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid GitHub token or authentication failed');
      }

      const userData = await response.json();
      
      // Verify username matches
      if (userData.login.toLowerCase() !== username.toLowerCase()) {
        throw new Error('Username does not match the token owner');
      }

      onAuth(token, username, repoName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-lg shadow-2xl p-6 ${
        theme === 'dark' ? 'bg-[#1a1a1a] border border-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl">GitHub Integration</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect your GitHub account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Personal Access Token
            </Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={theme === 'dark' ? 'bg-[#0a0a0a] border-gray-800' : ''}
            />
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              Generate at: github.com/settings/tokens (need 'repo' scope)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">GitHub Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="yourusername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={theme === 'dark' ? 'bg-[#0a0a0a] border-gray-800' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoName">Repository Name</Label>
            <Input
              id="repoName"
              type="text"
              placeholder="hdl-workspace"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className={theme === 'dark' ? 'bg-[#0a0a0a] border-gray-800' : ''}
            />
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              Repository will be created if it doesn't exist
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Connect'}
            </Button>
          </div>
        </form>

        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>How to create a token:</strong>
          </p>
          <ol className={`text-xs mt-2 space-y-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-600'}`}>
            <li>1. Go to GitHub Settings → Developer settings</li>
            <li>2. Click "Personal access tokens" → "Tokens (classic)"</li>
            <li>3. Generate new token with <strong>repo</strong> scope</li>
            <li>4. Copy and paste the token above</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
