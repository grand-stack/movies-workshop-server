export const typeDefs = `
  type Movie {
  movieId: ID!
  title: String
  year: Int
  plot: String
  poster: String
  imdbRating: Float
  genres: [String]
  similar(first: Int=3, offset:Int=0): [Movie]
}

type Query {
  moviesByTitle(subString: String!, first: Int=3, offset: Int=0): [Movie]
}
`;

export const resolvers = {
  Query: {
    moviesByTitle: (root, args, context) => {
      let session = context.driver.session();
      let query = `TODO: CYPHER QUERY FOR MOVIES HERE!`
      return session
        .run(query, args)
        .then(result => {
          return result.records.map(record => {
            return record.get("movie").properties;
          });
        })
        .catch(error => {console.log(error)});
    }
  },
  Movie: {
    genres: (movie, _, context) => {
      let session = context.driver.session();
      let params = { movieId: movie.movieId };
      let query = `TODO: Cypher query for genres here`;

      return session
        .run(query, params)
        .then(result => {
          return result.records.map(record => {
            return record.get("genre");
          });
        })
        .catch(error => {console.log(error)});
    },
    similar: (movie, _, context) => {
      let session = context.driver.session();
      let params = { movieId: movie.movieId };
      let query = `TODO: Cypher query for movie recommendations here`;

      return session
        .run(query, params)
        .then(result => {
          return result.records.map(record => {
            return record.get("movie").properties;
          });
        })
        .catch(error => {console.log(error)});
    }
  }
};
