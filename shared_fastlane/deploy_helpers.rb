module SharedFastlane
  class DeployHelpers
    class << self
      def generate_build_number
        Time.now.to_i / 10
      end

      alias_method :generate_version_code, :generate_build_number

      def generate_version_number(platform_name)
        major, minor, patch = latest_version_parts(platform_name)

        version_bump_type = ENV['VERSION_BUMP_TYPE']&.downcase || 'patch'

        case version_bump_type
        when "major"
          "#{major + 1}.0.0"
        when "minor"
          "#{major}.#{minor + 1}.0"
        when "patch"
          "#{major}.#{minor}.#{patch + 1}"
        else
          fail ArgumentError, "version_bump_type invalid - must be major, minor or patch"
        end
      end

      alias_method :generate_version_name, :generate_version_number

      def generate_tag_name(platform_name, new_version_name, new_version_code)
        "#{platform_name}/beta/#{new_version_name}/#{new_version_code}"
      end

      def with_updated_env_file(include_build_commit: false)
        `cp ../../.env ../../.env.backup`
        `cp ../../.env.example ../../.env`

        add_dotenv_variable('GRAPHQL_API_URL', graphql_api_url)
        add_dotenv_variable('MIXPANEL_TOKEN', ENV['MIXPANEL_TOKEN'])
        add_dotenv_variable('FEATURE_MARK_AS_COMPLETE', ENV['FEATURE_MARK_AS_COMPLETE'])

        if ENV['STAGING_USERNAME'] && ENV['STAGING_PASSWORD']
          add_dotenv_variable('STAGING_USERNAME', ENV['STAGING_USERNAME'])
          add_dotenv_variable('STAGING_PASSWORD', ENV['STAGING_PASSWORD'])
        end

        if include_build_commit
          `echo "BUILD_COMMIT=$(git rev-parse --short HEAD)" >> ../../.env`
        end

        yield
      ensure
        `mv ../../.env.backup ../../.env`
      end

      private

      def add_dotenv_variable(name, value)
        `echo #{name}=#{Shellwords.escape(value)} >> ../../.env`
      end

      def graphql_api_url
        ENV['GRAPHQL_API_URL'] || 'https://www.futurelearn.com/graphql'
      end

      def latest_version_parts(platform_name)
        `git tag`.scan(/^#{Regexp.escape(platform_name)}\/beta\/(\d+)\.(\d+)\.(\d+)/)
          .map { |captured_groups| captured_groups.map(&:to_i) }
          .max
      end
    end
  end
end
