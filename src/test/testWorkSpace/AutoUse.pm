package AutoUse;
use Hoge::Fuga;
use Hoge::Piyo qw(create_piyo my_name pipi piyo_piyo);
use Smart::Args::TypeTiny qw(args args_pos);

# check_type is not used
sub new_from_name {
    args_pos my $class => 'Class',
             my $name  => 'Str',
    ;

    my $piyo = create_piyo;

    my $hash = {
        types => 'types is exported but hash key',
    };

    for(HOGE->@*) {
        print $_;
    }
}

# check_rule is not used
sub song {
    Hoge::Fuga->song;
    Hoge::Piyo->pipi(p => 1);
    my $sing = piyo_piyo(times => 2);
    my $name = my_name;
}

sub walk {
    args my $class => 'Class',
         my $stride => 'Int',
    ;
    print 'args is duplicate. so not used';
}

sub nyaa {
    print 'sub is ignored';
    print 'string nyaa is ignored';
    qw(
        ignore 
        nyaa
    );

    q/nyaa ignore/;

    qq(ignore nyaa);
}

=encoding utf-8

=head1 NAME

=head1 SYNOPSIS
    podnyaa
=cut