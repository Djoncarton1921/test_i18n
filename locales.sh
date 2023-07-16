#!/bin/bash

function containsElement() {
  local e
  for e in "${@:2}"; do [[ "$e" == "$1" ]] && return 0; done
  return 1
}

langs=$(sed 's/$/&\&to=/g' locales-list.txt | tr -d '\n' | sed 's/\&to=$//')
mkdir -p src/i18n
files_to_compare=()

for file in src/i18n/ua/*.js; do
  filename=$(basename "$file")
  all_subdirs_have_filename=true
  do_request_to_translate=false

  for subfile in src/i18n/ua/*.js; do
    for subdir in src/i18n/*/; do
      subfile_in_subdir="$subdir$filename"
      duplicate=false

      if ! containsElement "$subfile_in_subdir" "${files_to_compare[@]}"; then
        files_to_compare+=("$subfile_in_subdir")
      fi

      if [[ "$subfile_in_subdir" != "$subfile" ]]; then
        if [[ ! -e "$subfile_in_subdir" ]]; then
          all_subdirs_have_filename=false
          break
        fi
      fi
    done
  done

  if [[ $all_subdirs_have_filename == true ]]; then
    npm i esm
    node compare-locales.js "${files_to_compare[@]}"
    files_to_compare=()
  else
    do_request_to_translate=true
    echo "$subfile: Not all subdirectories have $filename"
  fi

  if [[ $do_request_to_translate == true ]]; then
    file_content=$(cat "$file")
    translated_text=$(curl -s -X POST "https://blanball.cognitiveservices.azure.com/translator/text/v3.0/translate?api-version=3.0&from=uk&to=$langs" \
      -H "Content-Type: application/json" \
      -H "Ocp-Apim-Subscription-Key: a32cf006d7184a00bb73f23b5a9d154a" \
      -d "[
        {
          \"text\": \"$file_content\"
        }
      ]")
    target_lang=$(echo "$translated_text" | jq -r '.[0].translations[0].to')
    mkdir -p "src/i18n/$target_lang"
    echo "$translated_text" | jq -r '.[0].translations[0].text' > "src/i18n/$target_lang/$filename"
  fi
done