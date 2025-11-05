export class GitHubService {
  constructor(config) {
    this.config = config;
  }

  async fetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async checkRepoExists() {
    try {
      await this.fetch(
        `https://api.github.com/repos/${this.config.username}/${this.config.repoName}`
      );
      return true;
    } catch {
      return false;
    }
  }

  async createRepo(description = 'HDL Workspace - Verilog projects') {
    await this.fetch('https://api.github.com/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: this.config.repoName,
        description,
        private: false,
        auto_init: true,
      }),
    });
  }

  async getFileContent(path) {
    try {
      const data = await this.fetch(
        `https://api.github.com/repos/${this.config.username}/${this.config.repoName}/contents/${path}`
      );
      return {
        content: atob(data.content.replace(/\n/g, '')),
        sha: data.sha,
      };
    } catch {
      return null;
    }
  }

  async createOrUpdateFile(path, content, message, sha) {
    const body = {
      message,
      content: btoa(content),
    };

    if (sha) {
      body.sha = sha;
    }

    await this.fetch(
      `https://api.github.com/repos/${this.config.username}/${this.config.repoName}/contents/${path}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
  }

  async deleteFile(path, message, sha) {
    await this.fetch(
      `https://api.github.com/repos/${this.config.username}/${this.config.repoName}/contents/${path}`,
      {
        method: 'DELETE',
        body: JSON.stringify({
          message,
          sha,
        }),
      }
    );
  }

  async pushFiles(files, commitMessage) {
    // Check if repo exists, create if not
    const exists = await this.checkRepoExists();
    if (!exists) {
      await this.createRepo();
      // Wait a bit for repo to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Push each file
    for (const file of files) {
      const existing = await this.getFileContent(file.path);
      await this.createOrUpdateFile(
        file.path,
        file.content,
        commitMessage,
        existing?.sha
      );
    }
  }

  async listFiles() {
    try {
      const data = await this.fetch(
        `https://api.github.com/repos/${this.config.username}/${this.config.repoName}/contents`
      );
      
      if (Array.isArray(data)) {
        return data.map((item) => item.name);
      }
      return [];
    } catch {
      return [];
    }
  }

  getRepoUrl() {
    return `https://github.com/${this.config.username}/${this.config.repoName}`;
  }
}
