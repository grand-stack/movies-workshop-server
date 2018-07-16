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
      let query = `MATCH (movie:Movie) 
      WHERE toLower(movie.title) CONTAINS toLower($subString) 
      RETURN movie LIMIT 10;
      `
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
      let query = `MATCH (m:Movie) WHERE m.movieId = $movieId
      MATCH (m)-[:IN_GENRE]->(g:Genre)
      RETURN g.name AS genre`;

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
      let query = `MATCH (m:Movie) WHERE m.movieId = $movieId
      MATCH (m)-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(movie:Movie)
      WITH m, movie, COUNT(*) AS genreOverlap
      MATCH (m)<-[:RATED]-(:User)-[:RATED]->(movie:Movie)
      WITH movie,genreOverlap, COUNT(*) AS userRatedScore
      RETURN movie ORDER BY (0.9 * genreOverlap) + (0.1 * userRatedScore)  DESC LIMIT 3`;

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
