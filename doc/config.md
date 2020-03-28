# Environment configuration script

An olojs environment created on you local computer via `olojs init` or via
`OloJS.prototype.init`, should contain a configuration script named `olonv.js`.

This script should return an [environment](./environment.md) instance with a
`serve` method.

An easy way to create a valid environment configuration script is to
return and instance of [BackendEnvironment](./backend-environment.md).
