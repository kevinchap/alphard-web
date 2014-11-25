import com.byteground.sbt.SbtByTeGround.autoImport._
import com.byteground.sbt._
import com.typesafe.sbt.less.SbtLess.autoImport._
import com.typesafe.sbt.less._
import com.typesafe.sbt.mocha.SbtMocha.autoImport._
import com.typesafe.sbt.web.SbtWeb.autoImport.WebKeys._
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.typesafe.sbt.web._
import sbt.Keys._
import sbt._

object Build
  extends Build {
  lazy val root =
    bytegroundProject("web-util")
      .enablePlugins(
        SbtNpm,
        SbtLess,
        SbtWeb
      ).settings(
        organization := "com.byteground",
        scalaVersion := "2.10.4",
        crossPaths := false,
        importDirectly := true,
        libraryDependencies ++= Seq(
          "org.webjars" % "requirejs" % "2.1.14-3",
          "org.webjars" % "rjs" % "2.1.11-1-trireme" % "test",
          "org.webjars" % "angularjs" % "1.3.0",
          "org.webjars" % "angular-translate" % "2.4.2",
          "org.webjars" % "angular-ui-router" % "0.2.11",
          "org.webjars" % "angular-ui-bootstrap" % "0.11.2",
          "org.webjars" % "q" % "1.0.1",
          "org.webjars" % "bootstrap" % "3.2.0",
          "org.webjars" % "font-awesome" % "4.2.0"
        ),

        // Mocha
        MochaKeys.requires ++= Seq("_mocha.conf")
      ).settings(
        inConfig(Assets)(unscopedSettings) ++
          inConfig(TestAssets)(unscopedSettings)
          : _*
      )

  private val unscopedSettings = Seq(
    // Less
    includeFilter in LessKeys.less := "*.less",
    excludeFilter in LessKeys.less := "_*.less"
  )
}
