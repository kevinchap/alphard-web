resolvers +=  Resolver.url("Alphard Ivy Public Releases Repository", url("http://repository.alphard.io/ivy/public/releases"))(Resolver.ivyStylePatterns)

addSbtPlugin("io.alphard" %% "alphard-sbt-community-settings" % "3.36.0")

addSbtPlugin("io.alphard" %% "alphard-sbt-web" % "3.40.1")