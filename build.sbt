
def alphardWebProject(name: String) =
  alphardProject("web-" + name)
    .enablePlugins(SbtWeb)
    .settings(
      crossPaths := false
    )

////////////
// Common //
////////////

val log =
  alphardWebProject("log")

val uuid =
  alphardWebProject("uuid")

val xhr =
  alphardWebProject("xhr")

val http =
  alphardWebProject("http")

val jsonrpc =
  alphardWebProject("jsonrpc")

val smd =
  alphardWebProject("smd")

/////////////
// Require //
/////////////

val css =
  alphardWebProject("css")

val json =
  alphardWebProject("json")

val i18n =
  alphardWebProject("i18n")

val ng =
  alphardWebProject("ng")

val njk =
  alphardWebProject("njk")

/////////////
// Angular //
/////////////

val angularRequire =
  alphardWebProject("angular-require")

val root =
  alphardProject("web", isRoot = true)
    .aggregate(

      log,
      uuid,
      xhr,
      http,
      jsonrpc,
      smd,

      css,
      json,
      i18n,
      ng,
      njk,

      angularRequire

    )