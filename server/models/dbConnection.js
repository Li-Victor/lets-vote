import massive from 'massive';

export default massive(process.env.DB_URI, {
  scripts: `${__dirname}/dbScripts`
});
