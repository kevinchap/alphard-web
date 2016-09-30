def alphardWebProject(name: String) =
  alphardProject("web-" + name)
    .enablePlugins(SbtWeb)
    .settings(
      crossPaths := false
    )

////////////
// Common //
////////////

val webLogger =
  alphardWebProject("logger")

/////////////
// Require //
/////////////

val webRequireCss =
  alphardWebProject("require-css")

val webRequireJson =
  alphardWebProject("require-json")

val webRequireI18n =
  alphardWebProject("require-i18n")

val webRequireNg =
  alphardWebProject("require-ng")

val webRequireNjk =
  alphardWebProject("require-njk")

/////////////
// Angular //
/////////////

val webAngularRequire =
  alphardWebProject("angular-require")

val root =
  alphardProject("web", isRoot = true)
    .aggregate(
      webLogger,

      webRequireCss,
      webRequireJson,
      webRequireI18n,
      webRequireNg,
      webRequireNjk,

      webAngularRequire
    )