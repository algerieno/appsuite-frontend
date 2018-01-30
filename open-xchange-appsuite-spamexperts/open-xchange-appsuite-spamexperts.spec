Name:           open-xchange-appsuite-spamexperts
Version:        @OXVERSION@
%define         ox_release 30
Release:        %{ox_release}_<CI_CNT>.<B_CNT>
Group:          Applications/Productivity
Packager:       Viktor Pracht <viktor.pracht@open-xchange.com>
License:        CC-BY-NC-SA-3.0
Summary:        Configuration UI for SpamExperts
Source:         %{name}_%{version}.orig.tar.bz2

BuildArch:      noarch
BuildRoot:      %{_tmppath}/%{name}-%{version}-root
%if 0%{?rhel_version} && 0%{?rhel_version} >= 700
BuildRequires:  ant
%else
BuildRequires:  ant-nodeps
%endif
BuildRequires:  java-devel >= 1.6.0
BuildRequires:  nodejs >= 0.10.0

Requires(post): open-xchange-appsuite-manifest

%description
Configuration UI for SpamExperts

## Uncomment for multiple packages (1/4)
#%if 0%{?rhel_version} || 0%{?fedora_version}
#%define docroot /var/www/html/appsuite
#%else
#%define docroot /srv/www/htdocs/appsuite
#%endif
#
#%package        static
#Group:          Applications/Productivity
#Summary:        Configuration UI for SpamExperts
#Requires:       open-xchange-appsuite
#
#%description    static
#Configuration UI for SpamExperts
#
#This package contains the static files for the theme.

%prep
%setup -q

%build

%install
export NO_BRP_CHECK_BYTECODE_VERSION=true
ant -Dbasedir=build -DdestDir=%{buildroot} -DpackageName=%{name} -Dhtdoc=%{docroot} -DkeepCache=true -f build/build.xml build

## Uncomment for multiple packages (2/4)
#files=$(find "%{buildroot}/opt/open-xchange/appsuite/" -type f \
#             ! -regex '.*\.\(js\|css\|less\|json\)' -printf '%%P ')
#for i in $files
#do
#    mkdir -p "%{buildroot}%{docroot}/$(dirname $i)"
#    cp "%{buildroot}/opt/open-xchange/appsuite/$i" "%{buildroot}%{docroot}/$i"
#done

%clean
%{__rm} -rf %{buildroot}

## Uncomment for multiple packages (3/4)
#rm -r "%{buildroot}%{docroot}"

%define update "/opt/open-xchange/appsuite/share/update-themes.sh"

%post
if [ $1 -eq 1 -a -x %{update} ]; then %{update} --later; fi

%postun
if [ -x %{update} ]; then %{update} --later; fi

%files
%defattr(-,root,root)
%dir /opt/open-xchange
%dir /opt/open-xchange/appsuite
%dir /opt/open-xchange/appsuite/apps
%dir /opt/open-xchange/appsuite/apps/com.spamexperts
%dir /opt/open-xchange/appsuite/apps/com.spamexperts/settings
/opt/open-xchange/appsuite/apps/com.spamexperts/*
/opt/open-xchange/appsuite/apps/com.spamexperts/settings/*
%dir /opt/open-xchange/appsuite/manifests
/opt/open-xchange/appsuite/manifests/open-xchange-appsuite-spamexperts.json

## Uncomment for multiple packages (4/4)
#%files static
#%defattr(-,root,root)
#%{docroot}

%changelog
* Tue Jan 30 2018 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2018-02-05 (4553)
* Mon Dec 04 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-12-11 (hotfix-4471)
* Mon May 08 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-05-15 (4131)
* Fri Apr 21 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-05-02 (4112)
* Fri Apr 07 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-04-18 (4083)
* Wed Mar 29 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-04-03 (4049)
* Fri Mar 10 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-03-20 (4015)
* Mon Mar 06 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-03-06 (3984)
* Fri Feb 10 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-02-20 (3951)
* Fri Jan 27 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-02-06 (3917)
* Mon Jan 16 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-01-23 (3878)
* Wed Jan 04 2017 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2017-01-09 (3848)
* Mon Dec 12 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-12-19 (3813)
* Mon Nov 28 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-12-05 (3763)
* Fri Nov 18 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-11-21 (3731)
* Mon Nov 07 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-11-07 (3678)
* Wed Oct 19 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-10-24 (3630)
* Thu Oct 06 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-10-10 (3597)
* Wed Sep 28 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-09-27 (3590)
* Mon Sep 19 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-09-26 (3572)
* Thu Sep 08 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-09-14 (3562)
* Mon Sep 05 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-09-12 (3547)
* Tue Aug 23 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-08-29 (3522)
* Mon Aug 15 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-08-16 (3513)
* Mon Aug 08 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-08-15 (3490)
* Fri Jul 22 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2016-08-01 (3467)
* Tue Jul 12 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Second candidate for 7.8.2 release
* Wed Jul 06 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
First candidate for 7.8.2 release
* Wed Jun 29 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Second preview for 7.8.2 release
* Tue Jun 14 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
First release candidate for 7.8.2
* Fri Apr 08 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
prepare for 7.8.2 release
* Wed Mar 30 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Second candidate for 7.8.1 release
* Fri Mar 25 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
First candidate for 7.8.1 release
* Tue Mar 15 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Fifth preview of 7.8.1 release
* Fri Mar 04 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Fourth preview of 7.8.1 release
* Sat Feb 20 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Third candidate for 7.8.1 release
* Tue Feb 02 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
Second candidate for 7.8.1 release
* Tue Jan 26 2016 Viktor Pracht <viktor.pracht@open-xchange.com>
First candidate for 7.8.1 release
* Wed Nov 11 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-11-16 (2862)
* Fri Nov 06 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-11-09 (2840)
* Tue Nov 03 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-11-09 (2841)
* Thu Oct 29 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-11-11 (2844)
* Tue Oct 20 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-10-26 (2816)
* Mon Oct 19 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-10-26 (2812)
* Thu Oct 08 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
prepare for 7.8.1 release
* Tue Oct 06 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Sixth candidate for 7.8.0 release
* Wed Sep 30 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-10-12 (2784)
* Fri Sep 25 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Fith candidate for 7.8.0 release
* Thu Sep 24 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-09-28 (2767)
* Fri Sep 18 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Fourth candidate for 7.8.0 release
* Tue Sep 08 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-09-14 (2732)
* Mon Sep 07 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Third candidate for 7.8.0 release
* Fri Aug 21 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Second candidate for 7.8.0 release
* Tue Aug 18 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-08-24 (2674)
* Thu Aug 06 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-08-17 (2666)
* Wed Aug 05 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
First candidate for 7.8.0 release
* Wed Aug 05 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-08-10
* Tue Aug 04 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-08-03 (2650)
* Fri Jul 17 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-07-20 (2637)
* Fri Jul 17 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-07-20 (2614)
* Tue Jun 30 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-06-29 (2569)
* Wed Jun 24 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-06-26 (2573)
* Wed Jun 10 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-06-08 (2540)
* Tue Jun 09 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-06-08 (2539)
* Tue May 19 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-05-26 (2521)
* Fri May 15 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-05-26 (2520)
* Tue May 05 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-05-04 (2496)
* Fri Apr 24 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-09-09 (2495)
* Thu Apr 23 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-04-17 (2491)
* Tue Apr 14 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-04-13 (2473)
* Tue Apr 14 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-04-13 (2474)
* Fri Mar 27 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-03-29 (2475)
* Wed Mar 25 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-03-30 (2459)
* Mon Mar 23 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-03-30 (2446)
* Fri Mar 13 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Twelfth candidate for 7.6.2 release
* Fri Mar 13 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-03-16
* Fri Mar 06 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Eleventh candidate for 7.6.2 release
* Wed Mar 04 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Tenth candidate for 7.6.2 release
* Tue Mar 03 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Nineth candidate for 7.6.2 release
* Tue Feb 24 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Eighth candidate for 7.6.2 release
* Thu Feb 12 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-02-23
* Wed Feb 11 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Seventh candidate for 7.6.2 release
* Tue Feb 10 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-02-11
* Tue Feb 03 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-02-09
* Fri Jan 30 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Sixth candidate for 7.6.2 release
* Tue Jan 27 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Fifth candidate for 7.6.2 release
* Wed Jan 21 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-10-27
* Wed Jan 21 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-01-26
* Wed Jan 07 2015 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2015-01-12
* Tue Dec 16 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-12-22
* Fri Dec 12 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Fourth candidate for 7.6.2 release
* Wed Dec 10 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-12-15
* Fri Dec 05 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Third candidate for 7.6.2 release
* Tue Nov 25 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-12-01
* Fri Nov 21 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Second candidate for 7.6.2 release
* Thu Nov 13 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-11-17
* Wed Nov 05 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
prepare for 7.8.0 release
* Fri Oct 31 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
First candidate for 7.6.2 release
* Tue Oct 28 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-11-03
* Mon Oct 27 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-10-30
* Wed Oct 22 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-10-22
* Tue Oct 14 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Fifth candidate for 7.6.1 release
* Mon Oct 13 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-10-20
* Fri Oct 10 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Fourth candidate for 7.6.1 release
* Thu Oct 02 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Third candidate for 7.6.1 release
* Tue Sep 30 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-10-06
* Tue Sep 23 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-10-02
* Wed Sep 17 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
prepare for 7.6.2 release
* Tue Sep 16 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Second candidate for 7.6.1 release
* Thu Sep 11 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-09-15
* Fri Sep 05 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
First release candidate for 7.6.1
* Fri Sep 05 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
prepare for 7.6.1
* Wed Aug 20 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-08-25
* Mon Aug 11 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-08-11
* Wed Jul 23 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-07-30
* Mon Jul 21 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Build for patch 2014-07-21
* Wed Jun 25 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Seventh candidate for 7.6.0 release
* Fri Jun 20 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Sixth candidate for 7.6.0 release
* Fri Jun 13 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Fifth candidate for 7.6.0 release
* Thu Jan 23 2014 Viktor Pracht <viktor.pracht@open-xchange.com>
Initial Release.
