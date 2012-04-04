#!/usr/bin/ruby

filename_in = 'dugong_sample_points.csv'
filename_out = 'dugong_sample.csv'
line_no = -1
year_ary = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012]
season_ary = [0,1,2,3]
File.open(filename_out, "w") do |f_out|
  File.open(filename_in).each_line do |line|
    line = line.chomp
    if line_no < 0
      line << ',year,season,gender'
    else
      line << ",#{year_ary[rand(year_ary.length)]}"
      line << ",#{season_ary[rand(season_ary.length)]}"
      line << ",#{rand(2)}"
    end
    #write line to new file
    f_out<< line+"\n"
    line_no += 1
  end
end