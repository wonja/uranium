require ::File.dirname(__FILE__) + '/controllers'

map "/" do 
  run Uranium::Controllers::Bundler
end
