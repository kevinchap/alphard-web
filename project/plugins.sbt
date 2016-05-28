resolvers += Resolver.url("Alphard Ivy Public Releases Repository", url("http://repository.alphard.io/ivy/public/releases"))(Resolver.ivyStylePatterns)

addSbtPlugin("io.alphard" %% "alphard-sbt-community-settings" % "3.33.0")

//addSbtPlugin("io.alphard" %% "alphard-sbt-web" % "3.33.0")

addSbtPlugin("com.typesafe.sbt" %% "sbt-less" % "1.0.4")