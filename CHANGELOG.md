# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.1] - 2021-05-17
### Fixed
- Added usage in README.md file

## [0.5.0] - 2020-05-04

### Added
- [`allow-top-navigation`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) to `sandbox` attribute.

## [0.4.2] - 2020-03-03
### Added
- Allow sandbox's inframe to read UTF-8.

## [0.4.1] - 2020-02-28

## [0.4.0] - 2020-02-07
### Added
- Allow sandbox's iframe to open a new window.

## [0.3.1] - 2019-12-17
### Added
- Allow sandbox's iframe submit forms.

## [0.3.0] - 2019-09-23
### Added
- `sandbox.order`, a Sandbox that receives the current OrderForm as props.

## [0.2.1] - 2019-08-29

## [0.2.0] - 2019-07-05
### Added
- `sandbox.product` a Sandbox that receives the Product context as props. That way it's possible to use sandbox inside a `flex-layout` and still have the product context.

## [0.1.0] - 2019-07-05
### Added
- Auto resize height of the iframe based on it's content height.

## [0.0.5] - 2019-05-24

## [0.0.4] - 2019-05-24

## [0.0.3] - 2019-05-24

## [0.0.2] - 2019-05-23

### Changed
- Use an injected `init()` function to establish a postMessage communication channel
- Inject styles from parent
- Inject cookies from parent and allow iframe to postMessage with set cookies

## [0.0.1] - 2019-05-21

- **Component** Initial implementation
