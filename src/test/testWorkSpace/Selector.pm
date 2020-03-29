package Selector;
use strict;
use warnings;
use utf8;

use Smart::Args::TypeTiny qw(args);

sub foo_func {
    args my $class => 'ClassName',
    ;

    Hoge::Bar->bar_method();
    Hoge::Bar::bar_subroutine();

    Animal::Cat->nyaa(
        volume => 'loud',
    );

    Human->waaa;
}