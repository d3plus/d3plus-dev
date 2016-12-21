const LabelSync = require("github-issues-label-sync"),
      shell = require("shelljs"),
      token = shell.env.GITHUB_TOKEN,
      {name} = JSON.parse(shell.cat("package.json"));

// labeling system inspired by
// https://robinpowered.com/blog/best-practice-system-for-organizing-and-tagging-github-issues/
module.exports = log => {

  log.timer("syncing github repository issue label names and colors");

  const labels = [
    {color: "#ee3f46", name: "bug"},

    {color: "#fef2c0", name: "chore"},

    {color: "#ffc274", name: "design"},

    {color: "#91ca55", name: "feature"},

    {color: "#5ebeff", name: "enhancement"},
    {color: "#5ebeff", name: "optimization"},

    {color: "#cc317c", name: "discussion"},
    {color: "#cc317c", name: "question"},

    {color: "#ededed", name: "duplicate"},
    {color: "#ededed", name: "invalid"},
    {color: "#ededed", name: "wontfix"},
    {color: "#ededed", name: "greenkeeper"}
  ].map(l => ({name: l.name, color: l.color.substring(1)}));

  const issueSync = new LabelSync({}, "d3plus", name, token);
  issueSync.createLabels(labels)
    .catch(err => {
      log.fail();
      shell.echo(err.toJSON());
      shell.exit(1);
    })
    .then(() => {
      issueSync.updateLabels(labels)
        .then(() => {
          log.exit();
          shell.exit(0);
        })
        .catch(err => {
          log.fail();
          shell.echo(err.toJSON());
          shell.exit(1);
        });
    });

};
