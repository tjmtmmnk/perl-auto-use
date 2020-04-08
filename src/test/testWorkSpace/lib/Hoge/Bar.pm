package Hoge::Bar;

use Exporter 'import';
our @EXPORT = qw/args nyaa podnyaa/;

sub args {
    print 'exported and be duplicate';
}

sub nyaa { }

sub podnyaa {}