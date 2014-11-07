addSbtPlugin("com.byteground" %% "byteground-sbt-community-settings" % "3.4.0")

addSbtPlugin("com.typesafe.sbt" % "sbt-mocha" % "1.0.2")

resolvers += Resolver.url("sbt snapshot plugins", url("http://repo.scala-sbt.org/scalasbt/sbt-plugin-snapshots"))(Resolver.ivyStylePatterns)
