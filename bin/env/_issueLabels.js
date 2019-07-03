const Octokit = require("@octokit/rest"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name} = JSON.parse(shell.cat("package.json"));

module.exports = log => {

  log.timer("syncing github repository issue labels");

  const masterLabels = [
    {color: "ee3f46", name: "bug"},
    {color: "fef2c0", name: "chore"},
    {color: "ffc274", name: "design"},
    {color: "128A0C", name: "good first issue"},
    {color: "91ca55", name: "feature"},
    {color: "5ebeff", name: "enhancement"},
    {color: "cc317c", name: "discussion"}
  ];

  const repo = {owner: "d3plus", repo: name};
  const github = new Octokit({auth: token});

  github.issues
    .listLabelsForRepo(repo)
    .then(resp => {
      const existingLabels = resp.data.map(issue => {
        const index = masterLabels.findIndex(d => d.name === issue.name);
        if (index >= 0) {
          const issueContent = masterLabels.splice(index, 1);
          return github.issues.updateLabel(Object.assign({current_name: issue.name}, repo, issueContent));
        }
        else return github.issues.deleteLabel(Object.assign({name: issue.name}, repo));
      });
      const newLabels = masterLabels.map(issue => github.issues.createLabel(Object.assign(issue, repo)));
      return Promise.all(existingLabels.concat(newLabels));
    })
    .then(() => {
      log.exit();
      shell.exit(0);
    })
    .catch(err => {
      log.fail();
      shell.echo(err);
      shell.exit(1);
    });

};
