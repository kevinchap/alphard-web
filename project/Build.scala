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
    bytegroundProject("web-util", isRoot = true)
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
          "org.webjars" % "requirejs" % "2.1.15",
          "org.webjars" % "angularjs" % "1.3.10",
          "org.webjars" % "q" % "1.0.1",
          "org.webjars" % "bootstrap" % "3.3.4",
          "org.webjars" % "flag-icon-css" % "0.6.3"
        )
      ).settings(
        inConfig(Assets)(unscopedSettings) ++
          inConfig(TestAssets)(unscopedSettings)
          : _*
      )

  private val unscopedSettings = Seq(
    includeFilter in LessKeys.less := "*.less",
    excludeFilter in LessKeys.less := "_*.less"
  )
}
