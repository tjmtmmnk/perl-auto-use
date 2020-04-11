# Change Log

All notable changes to the "perl-auto-use" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## Version 0.1.0
- Initial release

## Version 0.2.0
- fix problem
  - avoided token including Perl's declare token

## Version 0.3.0
- changed where to insert use statement
  - insert after last use statement
- sort use statements ascending

## Version 0.4.0
- improve idempotency
  - you can exec auto use command even if use statements has already exist
- fix unintended handling of code action
- ignore POD

## Version 0.5.0
- fix problem
  - deleted use statements unintendedly

## Version 0.6.0
- fix problem
  - took so much time to scan for many files
  - string (e.g. `'string'`) was targeted to auto use
  - fully qualified subroutine (e.g. `JSON::Types::number`) wasn't targeted to auto use