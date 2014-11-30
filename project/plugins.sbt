addSbtPlugin("com.byteground" %% "byteground-sbt-community-settings" % "3.9.0")

addSbtPlugin("com.typesafe.sbt" %% "sbt-less" % "1.0.4")

resolvers += Resolver.url("sbt snapshot plugins", url("http://repo.scala-sbt.org/scalasbt/sbt-plugin-snapshots"))(Resolver.ivyStylePatterns)
