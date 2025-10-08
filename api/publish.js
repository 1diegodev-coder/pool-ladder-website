const { Octokit } = require('@octokit/rest');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { commitMessage, players, matches, meta } = req.body;

    // Validate required fields
    if (!commitMessage || !players || !matches) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Octokit with GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const owner = process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
    const repo = process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG;
    const branch = process.env.GITHUB_BRANCH || 'main';

    console.log('📤 Publishing to:', { owner, repo, branch });

    // Get current commit SHA
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    const currentCommitSha = refData.object.sha;

    // Get current tree
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha
    });
    const currentTreeSha = commitData.tree.sha;

    // Create blobs for each file
    const playersBlob = await octokit.git.createBlob({
      owner,
      repo,
      content: Buffer.from(JSON.stringify(players, null, 2)).toString('base64'),
      encoding: 'base64'
    });

    const matchesBlob = await octokit.git.createBlob({
      owner,
      repo,
      content: Buffer.from(JSON.stringify(matches, null, 2)).toString('base64'),
      encoding: 'base64'
    });

    const metaBlob = await octokit.git.createBlob({
      owner,
      repo,
      content: Buffer.from(JSON.stringify(meta || { updated: new Date().toISOString() }, null, 2)).toString('base64'),
      encoding: 'base64'
    });

    // Create new tree
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: currentTreeSha,
      tree: [
        {
          path: 'data/players.json',
          mode: '100644',
          type: 'blob',
          sha: playersBlob.data.sha
        },
        {
          path: 'data/matches.json',
          mode: '100644',
          type: 'blob',
          sha: matchesBlob.data.sha
        },
        {
          path: 'data/meta.json',
          mode: '100644',
          type: 'blob',
          sha: metaBlob.data.sha
        }
      ]
    });

    // Create commit
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: `${commitMessage}\n\n🤖 Published via admin panel`,
      tree: newTree.sha,
      parents: [currentCommitSha]
    });

    // Update reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha
    });

    console.log('✅ Published successfully:', newCommit.sha);

    return res.status(200).json({
      success: true,
      commit: {
        sha: newCommit.sha,
        message: commitMessage,
        url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`
      }
    });

  } catch (error) {
    console.error('❌ Publish error:', error);
    return res.status(500).json({
      error: 'Failed to publish changes',
      details: error.message
    });
  }
}
