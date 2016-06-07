import com.typesafe.sbt.less.SbtLess.autoImport._
import com.typesafe.sbt.less._
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.typesafe.sbt.web._
import io.alphard.sbt.SbtCommunitySettings.autoImport._
import io.alphard.sbt.SbtNpm
import sbt.Keys._
import sbt._

object Build
  extends Build {
  lazy val root =
    alphardProject("web", isRoot = true)
      .enablePlugins(
        SbtNpm,
        SbtWeb,
        SbtLess
      ).settings(
      scalaVersion := "2.11.7",
      crossPaths := false,
      libraryDependencies ++= Seq(
        "org.webjars" % "requirejs" % "2.1.20",
        "org.webjars" % "angularjs" % "1.4.7",
        "org.webjars" % "q" % "1.0.1",
        "org.webjars" % "bootstrap" % "3.3.5",
        "org.webjars" % "flag-icon-css" % "0.7.1",
        "org.webjars" % "keen-js" % "3.3.0",
        "org.webjars" % "video-js" % "5.8.8"
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
