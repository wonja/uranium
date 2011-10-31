require 'sinatra/base'
require 'fusion'

module Uranium
  module Controllers    

    # TODO: Make a widget whitelist for each browser type so that only widgets that are supported can be used

    class Bundler < Sinatra::Base

      @@bundles = {}

      puts "This dir: #{File.dirname(__FILE__)}"

      @@build_path = File.join(File.dirname(__FILE__), "../build")
      @@lib_path = File.join(File.dirname(__FILE__), "../lib")


      @@base_bundle = [
                       "external/xui-2.0.0.js",
                       "uranium_mixins.js"
                      ]


      # TODO: Update Ur so I can actually obfuscate instead of just do simple optimizations
      @@bundlers = {
        "pretty" => Fusion::Quick,
        "minified" => Fusion::Optimized 
      }

      def bundle(params, bundler_mode='pretty', browser='webkit')
        content_type 'text/plain'

        if params.keys.size == 0 || params.keys.include?("all")
          File.read(File.join(@@build_path, "src", "uranium-pretty.js"))
        else
          widgets = []

          # NOTE : Should I throw an error if a widget is specified but not found?
          params.each do |widget, flag|
            widget_file = File.join(@@lib_path, "#{widget}.js")
            widgets << widget if File.exist?( widget_file )
          end

          build_key = get_key(widgets, bundler_mode)

          existing_bundle = fetch_bundle(build_key)
          return existing_bundle if existing_bundle

          widgets = @@base_bundle + widgets.collect {|w| "#{w}.js"}
          widgets.flatten!

          puts "Widgets:"
          puts widgets

          this_bundle = {
            :output_file => "#{build_key}.js",
            :input_files => widgets
          }


          # I dont think this is threadsafe ...
          # TODO: Update fusion so that each instance has a separate config
          Fusion.configure({:bundle_configs => [this_bundle], :project_path => @@lib_path})
          bundler = @@bundlers[bundler_mode].new
          js = bundler.run.first
          
          save_bundle(build_key, js)

          js
        end
      end

      get "/uranium.js" do 
        # Is it going to be performance-prohibitive to run GCC?
        bundle(params, "minified")
      end

      get "/uranium-pretty.js" do
        puts params
        puts headers
        bundle(params)
      end

      private

      def get_key(widgets, bundler_mode)
        key = "#{bundler_mode}-"
        key << "xui-#{xui_version}---"
        key << widgets.sort.join("--")
        key
      end

      def xui_version
        @@base_bundle.first =~ /xui-(\d+\.\d+\.\d+)/
        $1
      end

      def save_bundle(key, js)
        Dir.mkdir(".bundles") unless Dir.exist?(".bundles")

        @@bundles[key] = js

        # TODO : Catch a terminate signal and output the files then
        File.open(bundle_filename(key), "w") {|f| f << js }
      end

      def bundle_filename(key)
        ".bundles/#{key}.js"
      end


      def fetch_bundle(key)
        return @@bundles[key] if @@bundles[key]

        bundle_file = bundle_filename(key)

        if File.exist?(bundle_file)
          puts "Already built #{key} ... re-serving"
          js = File.read(bundle_file)
          @@bundles[key] = js
          return js
        end

        nil
      end


    end

  end
end
